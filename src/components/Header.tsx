import { SLOGAN } from "../constants/branding";

export function Header() {
  return (
    <header className="topbar">
      <div className="marca">
        {/* Tamanho definido direto na imagem: não depende do CSS */}
        <img
          src={`${process.env.PUBLIC_URL}/logo.svg`}
          alt="Logo Recife ReaderDoc"
          width={48}
          height={48}
          style={{
            width: 48,
            height: 48,
            flexShrink: 0,
            borderRadius: "22%",
            boxShadow: "0 0 0 1.5px rgba(255, 255, 255, 0.35)",
          }}
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
