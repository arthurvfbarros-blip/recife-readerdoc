import { render, screen, fireEvent, act } from "@testing-library/react";
import App from "./App";

// pdfjs usa módulos ESM/worker que não rodam no Jest; não é necessário para este teste
jest.mock("./services/pdfjs", () => ({ pdfjs: {} }));
jest.mock("tesseract.js", () => ({ createWorker: jest.fn() }));

// o ambiente de teste (jsdom) não tem crypto.randomUUID
let n = 0;
Object.defineProperty(global, "crypto", { value: { randomUUID: () => `id-${++n}` } });

function eventoDeArquivos(tipo, arquivos) {
  const evento = new Event(tipo, { bubbles: true, cancelable: true });
  evento.dataTransfer = { types: ["Files"], files: arquivos, dropEffect: "none" };
  return evento;
}

test("mostra o aviso ao arrastar e adiciona o arquivo ao soltar", () => {
  render(<App />);
  const arquivo = new File(["%PDF-1.4"], "contrato.pdf", { type: "application/pdf" });

  expect(screen.queryByText(/Solte os arquivos aqui/i)).not.toBeInTheDocument();

  act(() => { window.dispatchEvent(eventoDeArquivos("dragenter", [arquivo])); });
  expect(screen.getByText(/Solte os arquivos aqui/i)).toBeInTheDocument();

  act(() => { window.dispatchEvent(eventoDeArquivos("drop", [arquivo])); });
  expect(screen.queryByText(/Solte os arquivos aqui/i)).not.toBeInTheDocument();
  expect(screen.getByText("contrato.pdf")).toBeInTheDocument();
  expect(screen.getByText(/1 arquivo\(s\)/i)).toBeInTheDocument();
});

test("ignora arrastes que não são de arquivos (ex.: texto selecionado)", () => {
  render(<App />);
  const evento = new Event("dragenter", { bubbles: true, cancelable: true });
  evento.dataTransfer = { types: ["text/plain"], files: [] };
  act(() => { window.dispatchEvent(evento); });
  expect(screen.queryByText(/Solte os arquivos aqui/i)).not.toBeInTheDocument();
});
