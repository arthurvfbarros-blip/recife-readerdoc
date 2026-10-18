import React, { useEffect } from "react";
import {
  ArrowLeft,
  FileText,
  Check,
  X,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { Documento } from "../types/documento";
import { Header } from "./Header";
import { useThumbnail } from "../hooks/useThumbnail";

interface ValidationViewProps {
  documentos: Documento[];
  validando: boolean;
  onValidate: () => Promise<void>;
  onBack: () => void;
}

/** Card individual de documento na grade de validação */
function ValCard({
  doc,
  validando,
}: {
  doc: Documento;
  validando: boolean;
}) {
  const previewUrl = useThumbnail(doc.arquivo);
  const pendente = doc.validacao === undefined;
  const ehValido = doc.validacao?.valido ?? true;

  return (
    <div
      className={`val-card ${
        pendente
          ? "val-card-pending"
          : ehValido
          ? "val-card-ok"
          : "val-card-err"
      }`}
      title={doc.validacao?.motivo || doc.nome}
    >
      {/* Badge de status */}
      <div
        className={`val-badge ${
          pendente
            ? "val-badge-pending"
            : ehValido
            ? "val-badge-ok"
            : "val-badge-err"
        }`}
      >
        {pendente ? (
          <RefreshCw size={16} className={validando ? "spinner" : ""} />
        ) : ehValido ? (
          <Check size={18} strokeWidth={3} />
        ) : (
          <X size={18} strokeWidth={3} />
        )}
      </div>

      {/* Req 4: Miniatura real da imagem ou ícone PDF */}
      <div className="val-card-thumb">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt={doc.nome}
            className="val-card-thumb-img"
          />
        ) : (
          <div className="val-card-thumb-pdf">
            <FileText size={36} />
            <span>PDF</span>
          </div>
        )}
      </div>

      {/* Req 4: Nome real do arquivo */}
      <span className="val-card-nome" title={doc.nome}>
        {doc.nome}
      </span>

      {/* Motivo (se inválido) */}
      {doc.validacao && !doc.validacao.valido && doc.validacao.motivo && (
        <span className="val-card-motivo">{doc.validacao.motivo}</span>
      )}
    </div>
  );
}

export function ValidationView({
  documentos,
  validando,
  onValidate,
  onBack,
}: ValidationViewProps) {
  // Executa a validação automaticamente ao entrar na tela se ainda não foi executada
  useEffect(() => {
    const precisaValidar = documentos.some((doc) => doc.validacao === undefined);
    if (precisaValidar && !validando && documentos.length > 0) {
      onValidate();
    }
  }, [documentos, validando, onValidate]);

  const temInvalido = documentos.some((doc) => doc.validacao && !doc.validacao.valido);
  const todosValidados =
    documentos.length > 0 && documentos.every((doc) => doc.validacao !== undefined);

  return (
    <div className="val-screen">
      <Header />

      {/* Sub-header / breadcrumb */}
      <div className="cv-subheader">
        <button
          type="button"
          className="cv-back-btn"
          onClick={onBack}
          aria-label="Voltar para início"
        >
          <ArrowLeft size={18} />
          Início
        </button>
        <span className="cv-subheader-title">Validação de documentos</span>
      </div>

      {/* Main */}
      <main className="cv-main">
        {/* Estado: sem documentos */}
        {documentos.length === 0 ? (
          <div className="val-vazio">
            <ShieldCheck size={52} strokeWidth={1.5} className="val-vazio-icon" />
            <p>Nenhum documento para validar.</p>
            <button type="button" className="btn-acao" onClick={onBack}>
              Inserir documentos
            </button>
          </div>
        ) : (
          <>
            {/* Loading */}
            {validando && (
              <div className="val-loading">
                <RefreshCw className="spinner" size={22} />
                <span>Validando integridade dos documentos...</span>
              </div>
            )}

            {/* Status banner */}
            {todosValidados && (
              <div
                className={`val-banner ${
                  temInvalido ? "val-banner-err" : "val-banner-ok"
                }`}
              >
                {temInvalido ? (
                  <>
                    <X size={20} strokeWidth={3} />
                    Atenção: há documento(s) com inconsistências.
                  </>
                ) : (
                  <>
                    <Check size={20} strokeWidth={3} />
                    Todos os documentos foram validados com sucesso!
                  </>
                )}
              </div>
            )}

            {/* Revalidate button */}
            {!validando && (
              <div className="val-revalidate-bar">
                <button
                  type="button"
                  className="btn-acao secundario"
                  onClick={onValidate}
                >
                  <RefreshCw size={15} />
                  Revalidar
                </button>
              </div>
            )}

            {/* Document grid — Req 4: miniatura + nome real */}
            <div className="val-list">
              {documentos.map((doc) => (
                <ValCard key={doc.id} doc={doc} validando={validando} />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
