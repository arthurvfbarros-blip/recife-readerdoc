import React from "react";
import { ArrowDown, ArrowLeft } from "lucide-react";

interface ExportViewProps {
  onBack: () => void;
  onGoToValidation: () => void;
  onExportCSV: () => void;
  onExportJSON: () => void;
  onExportXLSX: () => void;
  documentCount: number;
}

export function ExportView({
  onBack,
  onGoToValidation,
  onExportCSV,
  onExportJSON,
  onExportXLSX,
  documentCount,
}: ExportViewProps) {
  return (
    <section className="export-container">
      <div className="export-card">
        <button
          className="botao-voltar-topo"
          onClick={onBack}
          type="button"
          aria-label="Voltar"
        >
          <ArrowLeft size={24} />
          <span>Voltar</span>
        </button>

        <h1 className="export-title">Exportar como:</h1>

        {documentCount === 0 && (
          <p className="aviso-vazio">
            Nenhum documento disponível para exportação. Insira documentos primeiro.
          </p>
        )}

        <div className="export-options">
          <button
            type="button"
            className="export-option-btn top"
            onClick={onExportCSV}
            disabled={documentCount === 0}
            title="Exportar como CSV"
          >
            <span>CSV</span>
            <ArrowDown className="export-icon" size={24} />
          </button>

          <button
            type="button"
            className="export-option-btn middle"
            onClick={onExportJSON}
            disabled={documentCount === 0}
            title="Exportar como JSON"
          >
            <span>JSON</span>
          </button>

          <button
            type="button"
            className="export-option-btn bottom"
            onClick={onExportXLSX}
            disabled={documentCount === 0}
            title="Exportar como XLSX"
          >
            <span>XLSX</span>
          </button>
        </div>

        <div className="export-footer">
          <button
            type="button"
            className="link-validar-docs"
            onClick={onGoToValidation}
          >
            Validar documentos
          </button>
        </div>
      </div>
    </section>
  );
}
