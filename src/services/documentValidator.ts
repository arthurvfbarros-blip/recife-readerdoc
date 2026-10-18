import { PDFDocument } from "pdf-lib";
import { Documento, DocumentoValidacao } from "../types/documento";

/**
 * Valida um documento individualmente.
 * Verifica integridade do arquivo, cabeçalho de PDF e estrutura de dados.
 */
export async function validarDocumento(documento: Documento): Promise<DocumentoValidacao> {
  try {
    const arquivo = documento.arquivo;

    // Arquivos vazios são inválidos
    if (!arquivo || arquivo.size === 0) {
      return {
        valido: false,
        motivo: "O arquivo está vazio (0 bytes).",
      };
    }

    if (documento.status === "Formato não suportado") {
      return {
        valido: false,
        motivo: "Formato de arquivo não suportado.",
      };
    }

    if (documento.status === "Erro na conversão") {
      return {
        valido: false,
        motivo: "Erro ocorrido durante a conversão do documento.",
      };
    }

    // Se já houver PDF gerado ou se for originalmente um PDF
    const conteudoParaValidar = documento.pdf || (arquivo.type === "application/pdf" ? arquivo : null);

    if (conteudoParaValidar) {
      const buffer = await conteudoParaValidar.arrayBuffer();

      // Verifica cabeçalho inicial de PDF (%PDF)
      const primeirosBytes = new Uint8Array(buffer.slice(0, 5));
      const cabecalho = String.fromCharCode(...Array.from(primeirosBytes));

      if (!cabecalho.startsWith("%PDF")) {
        return {
          valido: false,
          motivo: "Documento inválido, informações incorretas",
        };
      }

      // Tenta carregar com pdf-lib para assegurar integridade estrutural
      await PDFDocument.load(buffer, { ignoreEncryption: true });
      return { valido: true };
    }

    // Se for imagem aguardando conversão
    if (arquivo.type.startsWith("image/")) {
      return { valido: true };
    }

    return {
      valido: false,
      motivo: "Documento inválido, informações incorretas",
    };
  } catch {
    return {
      valido: false,
      motivo: "Documento inválido, informações incorretas",
    };
  }
}

/**
 * Executa a validação em lote de todos os documentos da lista.
 */
export async function validarTodosDocumentos(documentos: Documento[]): Promise<Documento[]> {
  return Promise.all(
    documentos.map(async (doc) => {
      const validacao = await validarDocumento(doc);
      return {
        ...doc,
        validacao,
      };
    })
  );
}
