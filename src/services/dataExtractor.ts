import { createWorker } from "tesseract.js";
import { pdfjs } from "./pdfjs";
import { CampoExtraido, DadosExtraidos, LinhaExtraida } from "../types/documento";

const IDIOMAS_OCR = "por+eng";

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

/** Separa uma linha em colunas quando há tabulação ou 2+ espaços seguidos */
function dividirColunas(texto: string): string[] {
  const partes = texto
    .split(/\t+|\s{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
  return partes.length > 0 ? partes : [texto.trim()];
}

function montarLinha(pagina: number, numero: number, texto: string, colunas?: string[]): LinhaExtraida {
  return { pagina, numero, texto, colunas: colunas ?? dividirColunas(texto) };
}

/** Detecta pares "Campo: Valor" (ex.: "CPF: 123.456.789-00") */
function detectarCampos(linhas: LinhaExtraida[]): CampoExtraido[] {
  const campos: CampoExtraido[] = [];
  const regex = /^([A-Za-zÀ-ÿ0-9][A-Za-zÀ-ÿ0-9 ./()_-]{1,40}?)\s*:\s*(\S.*)$/;

  for (const linha of linhas) {
    const m = linha.texto.match(regex);
    if (m) campos.push({ campo: m[1].trim(), valor: m[2].trim(), pagina: linha.pagina });
  }
  return campos;
}

/* ------------------------------------------------------------------ */
/* PDF com camada de texto                                             */
/* ------------------------------------------------------------------ */

interface ItemTexto {
  str: string;
  x: number;
  y: number;
  largura: number;
  altura: number;
}

/**
 * Agrupa os itens de texto do PDF em linhas (pela coordenada Y) e
 * em colunas (pelos espaços grandes entre itens na coordenada X).
 */
function itensParaLinhas(itens: ItemTexto[], pagina: number): LinhaExtraida[] {
  const ordenados = [...itens].sort((a, b) => b.y - a.y || a.x - b.x);
  const grupos: ItemTexto[][] = [];

  for (const item of ordenados) {
    const grupo = grupos[grupos.length - 1];
    const tolerancia = Math.max(2, (item.altura || 10) * 0.5);
    if (grupo && Math.abs(grupo[0].y - item.y) <= tolerancia) grupo.push(item);
    else grupos.push([item]);
  }

  const linhas: LinhaExtraida[] = [];

  grupos.forEach((grupo) => {
    grupo.sort((a, b) => a.x - b.x);
    const colunas: string[] = [];
    let atual = "";
    let fimAnterior: number | null = null;

    for (const item of grupo) {
      const tamanhoFonte = item.altura || 10;
      if (fimAnterior !== null) {
        const espaco = item.x - fimAnterior;
        if (espaco > tamanhoFonte * 1.5) {
          if (atual.trim()) colunas.push(atual.trim());
          atual = "";
        } else if (espaco > tamanhoFonte * 0.15 && !atual.endsWith(" ") && !item.str.startsWith(" ")) {
          atual += " ";
        }
      }
      atual += item.str;
      fimAnterior = item.x + item.largura;
    }
    if (atual.trim()) colunas.push(atual.trim());

    if (colunas.length > 0) {
      linhas.push(montarLinha(pagina, linhas.length + 1, colunas.join(" "), colunas));
    }
  });

  return linhas;
}

async function extrairTextoPdf(buffer: ArrayBuffer): Promise<{ linhas: LinhaExtraida[]; totalPaginas: number }> {
  const pdf = await pdfjs.getDocument({ data: buffer.slice(0) }).promise;
  const linhas: LinhaExtraida[] = [];

  for (let n = 1; n <= pdf.numPages; n++) {
    const pagina = await pdf.getPage(n);
    const conteudo = await pagina.getTextContent();

    const itens: ItemTexto[] = conteudo.items
      .filter((i: any) => typeof i.str === "string" && i.str.trim() !== "")
      .map((i: any) => ({
        str: i.str,
        x: i.transform[4],
        y: i.transform[5],
        largura: i.width,
        altura: i.height || Math.abs(i.transform[3]),
      }));

    linhas.push(...itensParaLinhas(itens, n));
  }

  return { linhas, totalPaginas: pdf.numPages };
}

/* ------------------------------------------------------------------ */
/* OCR (imagens e PDFs escaneados)                                     */
/* ------------------------------------------------------------------ */

function textoParaLinhas(texto: string, pagina: number): LinhaExtraida[] {
  return texto
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l, i) => montarLinha(pagina, i + 1, l));
}

async function ocrImagens(fontes: Array<File | HTMLCanvasElement>): Promise<LinhaExtraida[]> {
  const worker = await createWorker(IDIOMAS_OCR);
  try {
    const linhas: LinhaExtraida[] = [];
    for (let i = 0; i < fontes.length; i++) {
      const { data } = await worker.recognize(fontes[i]);
      linhas.push(...textoParaLinhas(data.text, i + 1));
    }
    return linhas;
  } finally {
    await worker.terminate();
  }
}

/** PDF escaneado (sem texto): renderiza cada página e aplica OCR */
async function ocrPdf(buffer: ArrayBuffer): Promise<{ linhas: LinhaExtraida[]; totalPaginas: number }> {
  const pdf = await pdfjs.getDocument({ data: buffer.slice(0) }).promise;
  const canvases: HTMLCanvasElement[] = [];

  for (let n = 1; n <= pdf.numPages; n++) {
    const pagina = await pdf.getPage(n);
    const viewport = pagina.getViewport({ scale: 2 });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    await pagina.render({ canvas, canvasContext: canvas.getContext("2d")!, viewport }).promise;
    canvases.push(canvas);
  }

  return { linhas: await ocrImagens(canvases), totalPaginas: pdf.numPages };
}

/* ------------------------------------------------------------------ */
/* API pública                                                         */
/* ------------------------------------------------------------------ */

/** Req 2: lê o conteúdo real do documento (PDF ou imagem) e o organiza em linhas/colunas/campos */
export async function extrairDados(arquivo: File): Promise<DadosExtraidos> {
  if (arquivo.type === "application/pdf") {
    const buffer = await arquivo.arrayBuffer();
    let { linhas, totalPaginas } = await extrairTextoPdf(buffer);
    let origem: DadosExtraidos["origem"] = "texto-pdf";

    if (linhas.length === 0) {
      ({ linhas, totalPaginas } = await ocrPdf(buffer));
      origem = "ocr";
    }
    return { origem, totalPaginas, linhas, campos: detectarCampos(linhas) };
  }

  if (arquivo.type.startsWith("image/")) {
    const linhas = await ocrImagens([arquivo]);
    return { origem: "ocr", totalPaginas: 1, linhas, campos: detectarCampos(linhas) };
  }

  throw new Error("Formato não suportado.");
}
