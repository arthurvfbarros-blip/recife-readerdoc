import { ShieldCheck } from "lucide-react";

export function FooterInfo() {
  return (
    <section className="rodape-info">
      <ShieldCheck size={24} />
      <div>
        <strong>Validação de documentos</strong>
        <p>
          Confira os arquivos antes de utilizá-los. A conversão para PDF não garante a validade das informações contidas no documento.
        </p>
      </div>
    </section>
  );
}