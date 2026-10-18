import React from "react";
import {
  ArrowLeft,
  FileText,
  FileSpreadsheet,
  Braces,
  Table2,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Documento } from "../types/documento";

interface ExportViewProps {
  onBack: () => void;
  onGoToValidation: () => void;
  onExportCSV: () => void;
  onExportJSON: () => void;
  onExportXLSX: () => void;
  documentos: Documento[];
}

const FORMATS = [
  {
    id: "csv",
    label: "CSV",
    desc: "Planilha separada por vírgulas",
    Icon: Table2,
    color: "#1a7a4a",
    bg: "#e6f9ee",
    border: "#a0e5be",
  },
  {
    id: "json",
    label: "JSON",
    desc: "Dados estruturados em JSON",
    Icon: Braces,
    color: "#0756a4",
    bg: "#eaf2fb",
    border: "#c2dbf7",
  },
  {
    id: "xlsx",
    label: "XLSX",
    desc: "Planilha Excel",
    Icon: FileSpreadsheet,
    color: "#7a4a00",
    bg: "#fff8e6",
    border: "#f5d98a",
  },
] as const;

export function ExportView({
  onBack,
  onGoToValidation,
  onExportCSV,
  onExportJSON,
  onExportXLSX,
  documentos,
}: ExportViewProps) {
  const handlers: Record<string, () => void> = {
    csv: onExportCSV,
    json: onExportJSON,
    xlsx: onExportXLSX,
  };

  // Req 2: apenas documentos realmente convertidos ou já em PDF
  const prontos = documentos.filter(
    (doc) =>
      doc.status === "Convertido com sucesso" || doc.status === "PDF pronto"
  );
  const totalProntos = prontos.length;
  const totalTotal = documentos.length;
  const temPendentes = totalTotal > totalProntos;
  const podeExportar = totalProntos > 0;

  return (
    <div className="exp-screen">
      {/* Header — igual à home */}
      <header className="topbar">
        <div className="marca">
          <FileText size={32} />
          <div>
            <h1>Recife ReaderDoc</h1>
            <p>Converta e exporte documentos para planilhas</p>
          </div>
        </div>
        <span className="selo">Plataforma digital</span>
      </header>

      {/* Breadcrumb */}
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
        <span className="cv-subheader-title">Exportar documentos</span>
      </div>

      {/* Content */}
      <main className="exp-main">
        {/* Aviso: nenhum documento convertido */}
        {!podeExportar && (
          <div className="exp-aviso">
            <AlertCircle size={20} />
            Nenhum documento convertido ainda. Converta ao menos um documento antes de exportar.
          </div>
        )}

        {/* Aviso: há pendentes */}
        {podeExportar && temPendentes && (
          <div className="exp-aviso exp-aviso-info">
            <AlertCircle size={20} />
            {totalTotal - totalProntos} documento(s) ainda não convertido(s) não serão incluídos na exportação.
          </div>
        )}

        {/* Resumo dos documentos prontos */}
        {podeExportar && (
          <div className="exp-resumo">
            {prontos.map((doc) => (
              <div key={doc.id} className="exp-resumo-item">
                <CheckCircle2 size={16} className="exp-resumo-icon" />
                <span className="exp-resumo-nome" title={doc.nome}>{doc.nome}</span>
                <span className="exp-resumo-status">{doc.status}</span>
              </div>
            ))}
          </div>
        )}

        {/* Título */}
        <div className="exp-heading">
          <h2>Selecione o formato de exportação</h2>
          <p>
            {podeExportar
              ? `${totalProntos} documento(s) prontos para exportar.`
              : "Converta documentos para habilitar a exportação."}
          </p>
        </div>

        {/* Cards de formato */}
        <div className="exp-grid">
          {FORMATS.map(({ id, label, desc, Icon, color, bg, border }) => (
            <button
              key={id}
              type="button"
              className="exp-card"
              style={
                {
                  "--exp-color": color,
                  "--exp-bg": bg,
                  "--exp-border": border,
                } as React.CSSProperties
              }
              onClick={handlers[id]}
              disabled={!podeExportar}
            >
              <div className="exp-card-icon">
                <Icon size={36} />
              </div>
              <strong className="exp-card-label">{label}</strong>
              <span className="exp-card-desc">{desc}</span>
            </button>
          ))}
        </div>

        {/* Link para validação */}
        <div className="exp-footer">
          <button
            type="button"
            className="exp-validar-btn"
            onClick={onGoToValidation}
          >
            <ShieldCheck size={18} />
            Validar documentos antes de exportar
          </button>
        </div>
      </main>
    </div>
  );
}
