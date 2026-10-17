import { FileText } from "lucide-react";

export function Header() {
  return (
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
  );
}