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

/**
 * Exporta a lista de documentos para o formato CSV.
 */
export function exportarComoCSV(documentos: Documento[]): void {
  const cabecalhos = ["Nome do Arquivo", "Tipo", "Tamanho", "Status", "Validação", "Detalhes"];

  const linhas = documentos.map((doc) => {
    const validacaoTexto =
      doc.validacao !== undefined
        ? doc.validacao.valido
          ? "Válido"
          : "Inválido"
        : "Não validado";
    const motivoTexto = doc.validacao?.motivo ? `"${doc.validacao.motivo.replace(/"/g, '""')}"` : '""';

    return [
      `"${doc.nome.replace(/"/g, '""')}"`,
      `"${doc.arquivo.type || "Desconhecido"}"`,
      `"${formatarTamanho(doc.arquivo.size)}"`,
      `"${doc.status}"`,
      `"${validacaoTexto}"`,
      motivoTexto,
    ].join(";");
  });

  const conteudoCsv = "\uFEFF" + [cabecalhos.join(";"), ...linhas].join("\r\n");
  baixarArquivo(conteudoCsv, "recife_readerdoc_export.csv", "text/csv;charset=utf-8;");
}

/**
 * Exporta a lista de documentos para o formato JSON.
 */
export function exportarComoJSON(documentos: Documento[]): void {
  const dados = documentos.map((doc) => ({
    id: doc.id,
    nome: doc.nome,
    tipoMime: doc.arquivo.type || "desconhecido",
    tamanhoBytes: doc.arquivo.size,
    tamanhoLegivel: formatarTamanho(doc.arquivo.size),
    status: doc.status,
    validacao: doc.validacao
      ? {
          valido: doc.validacao.valido,
          motivo: doc.validacao.motivo || null,
        }
      : {
          valido: null,
          motivo: "Não validado",
        },
  }));

  const conteudoJson = JSON.stringify(dados, null, 2);
  baixarArquivo(conteudoJson, "recife_readerdoc_export.json", "application/json");
}

/**
 * Exporta a lista de documentos para uma planilha Excel (XLSX).
 */
export function exportarComoXLSX(documentos: Documento[]): void {
  const dadosPlanilha = documentos.map((doc, index) => ({
    Item: index + 1,
    "Nome do Arquivo": doc.nome,
    "Tipo de Arquivo": doc.arquivo.type || "Desconhecido",
    "Tamanho": formatarTamanho(doc.arquivo.size),
    "Status de Conversão": doc.status,
    "Status de Validação":
      doc.validacao !== undefined
        ? doc.validacao.valido
          ? "Válido"
          : "Inválido"
        : "Pendente",
    "Observações / Erros": doc.validacao?.motivo || "Nenhuma pendência",
  }));

  const worksheet = XLSX.utils.json_to_sheet(dadosPlanilha);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Documentos");

  XLSX.writeFile(workbook, "recife_readerdoc_export.xlsx");
}
