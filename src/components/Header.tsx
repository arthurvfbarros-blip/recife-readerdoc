import { SLOGAN } from "../constants/branding";

export function Header() {
  return (
    <header className="topbar">
      <div className="marca">
        <img
          src={`${process.env.PUBLIC_URL}/logo.svg`}
          alt="Logo Recife ReaderDoc"
          className="marca-logo"
        />
        <div>
          <h1>Recife ReaderDoc</h1>
          <p>{SLOGAN}</p>
        </div>
      </div>
      <span className="selo">Plataforma digital</span>
    </header>
  );
}
