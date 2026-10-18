import { useEffect, useState } from "react";
import { gerarMiniaturaPdf } from "../services";

/** Req 4: miniatura real do arquivo — imagem direta ou 1ª página do PDF */
export function useThumbnail(arquivo: File): string | null {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;
    let objectUrl: string | null = null;
    setUrl(null);

    if (arquivo.type.startsWith("image/")) {
      objectUrl = URL.createObjectURL(arquivo);
      setUrl(objectUrl);
    } else if (arquivo.type === "application/pdf") {
      gerarMiniaturaPdf(arquivo)
        .then((u) => !cancelado && setUrl(u))
        .catch(() => !cancelado && setUrl(null)); // PDF corrompido: fica o ícone
    }

    return () => {
      cancelado = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [arquivo]);

  return url;
}
