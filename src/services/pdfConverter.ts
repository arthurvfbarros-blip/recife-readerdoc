import { PDFDocument } from "pdf-lib";

export async function converterImagemParaPdf(arquivo: File): Promise<Blob> {
  const pdf = await PDFDocument.create();
  const bytes = await arquivo.arrayBuffer();

  const isPng =
    arquivo.type === "image/png" || arquivo.name.toLowerCase().endsWith(".png");

  const imagem = isPng
    ? await pdf.embedPng(bytes)
    : await pdf.embedJpg(bytes);

  const pagina = pdf.addPage([imagem.width, imagem.height]);

  pagina.drawImage(imagem, {
    x: 0,
    y: 0,
    width: imagem.width,
    height: imagem.height,
  });

  const pdfBytes = await pdf.save();
  return new Blob([pdfBytes], { type: "application/pdf" });
}

export function executarDownloadPdf(conteudo: Blob | File, nomeOriginal: string): void {
  const url = URL.createObjectURL(conteudo);
  const link = document.createElement("a");

  link.href = url;
  link.download = `${nomeOriginal.replace(/\.[^.]+$/, "")}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
}