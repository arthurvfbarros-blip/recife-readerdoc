import { useState } from "react";
import { Documento } from "../types/documento";
import {
  converterImagemParaPdf,
  executarDownloadPdf,
  validarTodosDocumentos,
  exportarComoCSV,
  exportarComoJSON,
  exportarComoXLSX,
  extrairDados,
} from "../services";

export function useDocumentManager() {
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [carregandoId, setCarregandoId] = useState<string | null>(null);
  const [validando, setValidando] = useState<boolean>(false);

  function adicionarArquivos(lista: FileList | null) {
    if (!lista) return;

    const novos: Documento[] = Array.from(lista).map((arquivo) => ({
      id: crypto.randomUUID(),
      nome: arquivo.name,
      arquivo,
      status: arquivo.type === "application/pdf"
        ? "PDF pronto"
        : arquivo.type.startsWith("image/")
        ? "Aguardando conversão"
        : "Formato não suportado",
    }));

    setDocumentos((anteriores) => [...anteriores, ...novos]);
  }

  /** Converte o documento e extrai o conteúdo real. Retorna true se deu certo. */
  async function converter(documento: Documento): Promise<boolean> {
    if (documento.status === "Formato não suportado") return false;
    if (documento.status === "Convertido com sucesso" && documento.dados) return true; // já convertido

    setCarregandoId(documento.id);

    try {
      let pdfBlob: Blob;

      if (documento.arquivo.type === "application/pdf") {
        pdfBlob = documento.arquivo;
      } else if (documento.arquivo.type.startsWith("image/")) {
        pdfBlob = await converterImagemParaPdf(documento.arquivo);
      } else {
        throw new Error("Formato não suportado.");
      }

      // Req 2: lê o conteúdo do documento (texto do PDF ou OCR da imagem)
      const dados = await extrairDados(documento.arquivo);

      setDocumentos((anteriores) =>
        anteriores.map((item) =>
          item.id === documento.id
            ? { ...item, pdf: pdfBlob, dados, status: "Convertido com sucesso" }
            : item
        )
      );
      return true;
    } catch (erro) {
      console.error("Falha na conversão:", erro);
      setDocumentos((anteriores) =>
        anteriores.map((item) =>
          item.id === documento.id ? { ...item, status: "Erro na conversão" } : item
        )
      );
      return false;
    } finally {
      setCarregandoId(null);
    }
  }

  function baixar(documento: Documento) {
    const conteudo = documento.pdf ?? (documento.arquivo.type === "application/pdf" ? documento.arquivo : null);
    if (!conteudo) return;

    executarDownloadPdf(conteudo, documento.nome);
  }

  function remover(id: string) {
    setDocumentos((anteriores) => anteriores.filter((item) => item.id !== id));
  }

  async function validarDocumentos() {
    if (documentos.length === 0) return;
    setValidando(true);
    try {
      const atualizados = await validarTodosDocumentos(documentos);
      setDocumentos(atualizados);
    } finally {
      setValidando(false);
    }
  }

  function exportarCSV() {
    exportarComoCSV(documentos);
  }

  function exportarJSON() {
    exportarComoJSON(documentos);
  }

  function exportarXLSX() {
    exportarComoXLSX(documentos);
  }

  return {
    documentos,
    carregandoId,
    validando,
    adicionarArquivos,
    converter,
    baixar,
    remover,
    validarDocumentos,
    exportarCSV,
    exportarJSON,
    exportarXLSX,
  };
}