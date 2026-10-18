import React from "react";
import {
  ArrowLeft,
  FileText,
  Download,
  Trash2,
  RefreshCw,
  CheckCircle2,
  XCircle,
  UploadCloud,
} from "lucide-react";
import { Documento } from "../types/documento";

interface ConversionViewProps {
  documentos: Documento[];
  carregandoId: string | null;
  onConvert: (doc: Documento) => void;
  onDownload: (doc: Documento) => void;
  onRemove: (id: string) => void;
  onAddFiles: (files: FileList | null) => void;
  onBack: () => void;
}

export function ConversionView({
  documentos,
  carregandoId,
  onConvert,
  onDownload,
  onRemove,
  onAddFiles,
  onBack,
}: ConversionViewProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onAddFiles(e.target.files);
    e.target.value = "";
  };

  const convertAll = () => {
    documentos
      .filter(
        (doc) =>
          doc.status === "Aguardando conversão" &&
          carregandoId !== doc.id
      )
      .forEach((doc) => onConvert(doc));
  };

  const pendentes = documentos.filter(
    (doc) => doc.status === "Aguardando conversão"
  ).length;

  return (
    <div className="cv-screen">
      {/* Header */}
      <header className="topbar">
        <div className="marca">
          <FileText size={32} />
          <div>
            <h1>Recife ReaderDoc</h1>
            <p>Gestão inteligente de documentos</p>
          </div>
        </div>
        <span className="selo">Plataforma digital</span>
      </header>

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
        <span className="cv-subheader-title">Conversão de documentos</span>
      </div>

      {/* Main content */}
      <main className="cv-main">
        {/* Upload zone */}
        <label className="upload cv-upload">
          <UploadCloud size={36} />
          <strong>Adicionar mais documentos</strong>
          <span>PDF, JPG ou PNG</span>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
            multiple
            onChange={handleChange}
          />
        </label>

        {/* Action bar */}
        {documentos.length > 0 && (
          <div className="cv-action-bar">
            <span className="cv-count">
              {documentos.length} arquivo(s) &nbsp;·&nbsp; {pendentes} aguardando conversão
            </span>
            <button
              type="button"
              className="cv-btn-all"
              onClick={convertAll}
              disabled={pendentes === 0 || carregandoId !== null}
            >
              <RefreshCw size={15} />
              Converter todos
            </button>
          </div>
        )}

        {/* Document list */}
        {documentos.length === 0 ? (
          <p className="vazio cv-vazio">
            Nenhum documento adicionado. Use o campo acima para começar.
          </p>
        ) : (
          <div className="cv-list">
            {documentos.map((doc) => {
              const isConverting = carregandoId === doc.id;
              const canDownload = Boolean(
                doc.pdf || doc.arquivo.type === "application/pdf"
              );
              const isConverted = doc.status === "Convertido com sucesso";
              const isError = doc.status === "Erro na conversão";
              const isUnsupported = doc.status === "Formato não suportado";
              const isPdf = doc.status === "PDF pronto";

              return (
                <article key={doc.id} className="cv-item">
                  {/* Icon */}
                  <div
                    className={`cv-item-icon ${
                      isConverted || isPdf
                        ? "cv-icon-ok"
                        : isError || isUnsupported
                        ? "cv-icon-err"
                        : "cv-icon-pending"
                    }`}
                  >
                    {isConverted || isPdf ? (
                      <CheckCircle2 size={22} />
                    ) : isError || isUnsupported ? (
                      <XCircle size={22} />
                    ) : (
                      <FileText size={22} />
                    )}
                  </div>

                  {/* Info */}
                  <div className="info">
                    <strong className="cv-item-name" title={doc.nome}>
                      {doc.nome}
                    </strong>
                    <span
                      className={`cv-item-status ${
                        isConverted || isPdf
                          ? "cv-status-ok"
                          : isError || isUnsupported
                          ? "cv-status-err"
                          : "cv-status-pending"
                      }`}
                    >
                      {isConverting ? "Convertendo..." : doc.status}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="cv-item-actions">
                    {!isPdf && !isConverted && !isUnsupported && (
                      <button
                        type="button"
                        className="btn-acao cv-btn-convert"
                        onClick={() => onConvert(doc)}
                        disabled={isConverting || isUnsupported}
                        title="Converter para PDF"
                      >
                        {isConverting ? (
                          <RefreshCw size={15} className="spinner" />
                        ) : (
                          <RefreshCw size={15} />
                        )}
                        {isConverting ? "Convertendo..." : "Converter"}
                      </button>
                    )}

                    <button
                      type="button"
                      className="btn-acao secundario icone"
                      onClick={() => onDownload(doc)}
                      disabled={!canDownload}
                      title="Baixar PDF"
                    >
                      <Download size={17} />
                    </button>

                    <button
                      type="button"
                      className="btn-acao secundario icone"
                      onClick={() => onRemove(doc.id)}
                      title="Remover documento"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
