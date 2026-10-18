import { pdfjs } from "./pdfjs";

/** Req 4: renderiza a primeira página do PDF e devolve uma URL de imagem (miniatura) */
export async function gerarMiniaturaPdf(arquivo: File, larguraMax = 240): Promise<string> {
  const buffer = await arquivo.arrayBuffer();
  const tarefa = pdfjs.getDocument({ data: buffer });
  const pdf = await tarefa.promise;
  const pagina = await pdf.getPage(1);

  const base = pagina.getViewport({ scale: 1 });
  const viewport = pagina.getViewport({ scale: larguraMax / base.width });

  const canvas = document.createElement("canvas");
  canvas.width = viewport.width;
  canvas.height = viewport.height;

  await pagina.render({ canvas, canvasContext: canvas.getContext("2d")!, viewport }).promise;
  const url = canvas.toDataURL("image/jpeg", 0.8);
  await tarefa.destroy();
  return url;
}
