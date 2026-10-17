import { FileText, Download, Trash2 } from "lucide-react";
import { Documento } from "../types/documento";

interface DocumentItemProps {
  documento: Documento;
  isConverting: boolean;
  onConvert: (doc: Documento) => void;
  onDownload: (doc: Documento) => void;
  onRemove: (id: string) => void;
}

export function DocumentItem({
  documento,
  isConverting,
  onConvert,
  onDownload,
  onRemove,
}: DocumentItemProps) {
  const canDownload = Boolean(documento.pdf || documento.arquivo.type === "application/pdf");

  return (
    <article className="documento">
      <FileText size={28} />
      <div className="info">
        <strong>{documento.nome}</strong>
        <span>{documento.status}</span>
      </div>

      <button
        onClick={() => onConvert(documento)}
        disabled={isConverting || documento.status === "Formato não suportado"}
      >
        {isConverting ? "Convertendo..." : "Converter"}
      </button>

      <button
        className="icone"
        onClick={() => onDownload(documento)}
        disabled={!canDownload}
        title="Baixar PDF"
      >
        <Download size={18} />
      </button>

      <button
        className="icone"
        onClick={() => onRemove(documento.id)}
        title="Remover documento"
      >
        <Trash2 size={18} />
      </button>
    </article>
  );
}