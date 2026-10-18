import { FileText } from "lucide-react";
import { SLOGAN } from "../constants/branding";

export function Header() {
  return (
    <header className="topbar">
      <div className="marca">
        <FileText size={32} />
        <div>
          <h1>Recife ReaderDoc</h1>
          <p>{SLOGAN}</p>
        </div>
      </div>
      <span className="selo">Plataforma digital</span>
    </header>
  );
}
