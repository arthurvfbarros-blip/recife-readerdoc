import * as XLSX from "xlsx";
import { Documento } from "../types/documento";

function baixarArquivo(conteudo: BlobPart, nomeArquivo: string, tipoMime: string): void {
  const blob = new Blob([conteudo], { type: tipoMime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = nomeArquivo;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
}

function formatarTamanho(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const tamanhos = ["Bytes", "KB", "MB", "GB"];
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${tamanhos[i]}`;
}

/** Req 2: só entram na exportação documentos convertidos que têm dados extraídos */
export function filtrarProntos(documentos: Documento[]): Documento[] {
  return documentos.filter((doc) => doc.status === "Convertido com sucesso" && doc.dados);
}

function textoValidacao(doc: Documento): string {
  if (!doc.validacao) return "Não validado";
  return doc.validacao.valido ? "Válido" : "Inválido";
}

function escaparCsv(valor: string | number): string {
  return `"${String(valor).replace(/"/g, '""')}"`;
}

/** Tabela única com o conteúdo de todos os documentos: 1 linha do documento = 1 linha da planilha */
function montarTabelaConteudo(prontos: Documento[]): { cabecalho: string[]; linhas: (string | number)[][] } {
  const maxColunas = Math.max(
    1,
    ...prontos.flatMap((d) => d.dados!.linhas.map((l) => l.colunas.length))
  );
  const cabecalho = [
    "Documento",
    "Página",
    "Linha",
    ...Array.from({ length: maxColunas }, (_, i) => `Coluna ${i + 1}`),
  ];

  const linhas = prontos.flatMap((doc) =>
    doc.dados!.linhas.map((l) => [
      doc.nome,
      l.pagina,
      l.numero,
      ...Array.from({ length: maxColunas }, (_, i) => l.colunas[i] ?? ""),
    ])
  );

  return { cabecalho, linhas };
}

/** CSV com o conteúdo extraído dos documentos (separador ";" para abrir direto no Excel pt-BR) */
export function exportarComoCSV(documentos: Documento[]): void {
  const prontos = filtrarProntos(documentos);
  if (prontos.length === 0) return;

  const { cabecalho, linhas } = montarTabelaConteudo(prontos);
  const conteudo =
    "\uFEFF" +
    [cabecalho, ...linhas].map((l) => l.map(escaparCsv).join(";")).join("\r\n");

  baixarArquivo(conteudo, "recife_readerdoc_export.csv", "text/csv;charset=utf-8;");
}

/** JSON estruturado: metadados + páginas/linhas/colunas + campos "chave: valor" */
export function exportarComoJSON(documentos: Documento[]): void {
  const prontos = filtrarProntos(documentos);
  if (prontos.length === 0) return;

  const dados = prontos.map((doc) => {
    const d = doc.dados!;
    const paginas = Array.from({ length: d.totalPaginas }, (_, i) => i + 1).map((pagina) => ({
      pagina,
      linhas: d.linhas
        .filter((l) => l.pagina === pagina)
        .map((l) => ({ numero: l.numero, texto: l.texto, colunas: l.colunas })),
    }));

    return {
      nome: doc.nome,
      tipoMime: doc.arquivo.type || "desconhecido",
      tamanhoBytes: doc.arquivo.size,
      tamanhoLegivel: formatarTamanho(doc.arquivo.size),
      validacao: doc.validacao
        ? { valido: doc.validacao.valido, motivo: doc.validacao.motivo ?? null }
        : { valido: null, motivo: "Não validado" },
      extracao: {
        metodo: d.origem === "ocr" ? "OCR" : "Texto do PDF",
        totalPaginas: d.totalPaginas,
        campos: d.campos,
        paginas,
      },
    };
  });

  baixarArquivo(JSON.stringify(dados, null, 2), "recife_readerdoc_export.json", "application/json");
}

/** XLSX com 3 abas: Conteúdo (linhas/colunas do documento), Campos (chave: valor) e Resumo */
export function exportarComoXLSX(documentos: Documento[]): void {
  const prontos = filtrarProntos(documentos);
  if (prontos.length === 0) return;

  const workbook = XLSX.utils.book_new();

  // 1ª aba: o conteúdo real extraído dos documentos (é a que o Excel abre primeiro)
  const { cabecalho, linhas } = montarTabelaConteudo(prontos);
  const abaConteudo = XLSX.utils.aoa_to_sheet([cabecalho, ...linhas]);
  abaConteudo["!cols"] = cabecalho.map((_, i) => ({ wch: i === 0 ? 32 : i < 3 ? 8 : 28 }));
  XLSX.utils.book_append_sheet(workbook, abaConteudo, "Conteúdo");

  // 2ª aba: pares "Campo: Valor" detectados (só se houver)
  const campos = prontos.flatMap((doc) =>
    doc.dados!.campos.map((c) => ({ Documento: doc.nome, Página: c.pagina, Campo: c.campo, Valor: c.valor }))
  );
  if (campos.length > 0) {
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(campos), "Campos");
  }

  // Última aba: metadados dos arquivos
  const resumo = prontos.map((doc, i) => ({
    Item: i + 1,
    "Nome do Arquivo": doc.nome,
    "Tipo de Arquivo": doc.arquivo.type || "Desconhecido",
    Tamanho: formatarTamanho(doc.arquivo.size),
    Páginas: doc.dados!.totalPaginas,
    "Método de leitura": doc.dados!.origem === "ocr" ? "OCR" : "Texto do PDF",
    "Linhas extraídas": doc.dados!.linhas.length,
    "Status de Validação": textoValidacao(doc),
    "Observações / Erros": doc.validacao?.motivo || "Nenhuma pendência",
  }));
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(resumo), "Resumo");

  XLSX.writeFile(workbook, "recife_readerdoc_export.xlsx");
}
