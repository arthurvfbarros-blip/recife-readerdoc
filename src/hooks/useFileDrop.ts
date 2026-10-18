import { useEffect, useRef, useState } from "react";

/**
 * Permite soltar arquivos em qualquer parte da página.
 * Retorna `arrastando` (true enquanto há arquivo sobre a tela) para mostrar um aviso visual.
 */
export function useFileDrop(onFiles: (files: FileList | null) => void, ativo = true): boolean {
  const [arrastando, setArrastando] = useState(false);
  const contador = useRef(0); // dragenter/dragleave disparam em cada elemento filho
  const callback = useRef(onFiles);
  callback.current = onFiles;

  useEffect(() => {
    if (!ativo) {
      contador.current = 0;
      setArrastando(false);
      return;
    }

    const temArquivos = (e: DragEvent) => Array.from(e.dataTransfer?.types ?? []).includes("Files");

    const aoEntrar = (e: DragEvent) => {
      if (!temArquivos(e)) return;
      e.preventDefault();
      contador.current += 1;
      setArrastando(true);
    };

    const aoSobrevoar = (e: DragEvent) => {
      if (!temArquivos(e)) return;
      e.preventDefault(); // necessário para permitir o "drop"
      if (e.dataTransfer) e.dataTransfer.dropEffect = "copy";
    };

    const aoSair = (e: DragEvent) => {
      if (!temArquivos(e)) return;
      contador.current = Math.max(0, contador.current - 1);
      if (contador.current === 0) setArrastando(false);
    };

    const aoSoltar = (e: DragEvent) => {
      if (!temArquivos(e)) return;
      e.preventDefault(); // evita o navegador abrir o arquivo
      contador.current = 0;
      setArrastando(false);
      if (e.dataTransfer?.files?.length) callback.current(e.dataTransfer.files);
    };

    window.addEventListener("dragenter", aoEntrar);
    window.addEventListener("dragover", aoSobrevoar);
    window.addEventListener("dragleave", aoSair);
    window.addEventListener("drop", aoSoltar);
    return () => {
      window.removeEventListener("dragenter", aoEntrar);
      window.removeEventListener("dragover", aoSobrevoar);
      window.removeEventListener("dragleave", aoSair);
      window.removeEventListener("drop", aoSoltar);
    };
  }, [ativo]);

  return arrastando;
}
