import { useFileDrop } from "./hooks/useFileDrop";
import { useState } from "react";
import { ShieldCheck, UploadCloud } from "lucide-react";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { FileUpload } from "./components/FileUpload";
import { DocumentItem } from "./components/DocumentItem";
import { ExportView } from "./components/ExportView";
import { ValidationView } from "./components/ValidationView";
import { useDocumentManager } from "./hooks/useDocumentManager";
import "./index.css";

export default function App() {
  const [currentView, setCurrentView] = useState("home"); // "home" | "export" | "validation"

  const {
    documentos,
    carregandoId,
    validando,
    adicionarArquivos,
    converter,
    baixar,
    remover,
    validarDocumentos,
    exportarCSV,
    exportarJSON,
    exportarXLSX,
  } = useDocumentManager();

  const arrastando = useFileDrop(adicionarArquivos, currentView === "home");

  // Req 1: Converte o documento e, ao terminar, navega para a tela de exportação
  async function handleConvert(doc) {
    const ok = await converter(doc);
    if (ok) setCurrentView("export"); // só avança se a conversão deu 
  }

  if (currentView === "export") {
    return (
      <main className="app">
        <ExportView
          onBack={() => setCurrentView("home")}
          onGoToValidation={() => {
            validarDocumentos();
            setCurrentView("validation");
          }}
          onExportCSV={exportarCSV}
          onExportJSON={exportarJSON}
          onExportXLSX={exportarXLSX}
          documentos={documentos}
        />
      </main>
    );
  }

  if (currentView === "validation") {
    return (
      <main className="app">
        <ValidationView
          documentos={documentos}
          validando={validando}
          onValidate={validarDocumentos}
          onBack={() => setCurrentView("home")}
        />
      </main>
    );
  }

  return (
    <main className="app">
      {arrastando && (
  <div className="drop-overlay" role="status" aria-live="polite">
    <div className="drop-overlay-box">
      <UploadCloud size={56} />
      <strong>Solte os arquivos aqui</strong>
      <span>PDF, JPG ou PNG</span>
    </div>
  </div>
      )}
      <Header />
      <Hero />

      <section className="painel">
        <h2>Inserir documentos</h2>
        <p>Aceitamos arquivos PDF, JPG e PNG.</p>

        <FileUpload onFilesSelected={adicionarArquivos} />

        <div className="cabecalho-lista">
          <div>
            <h3>Meus documentos</h3>
            <span>{documentos.length} arquivo(s)</span>
          </div>
        </div>

        {documentos.map((doc) => (
          <DocumentItem
            key={doc.id}
            documento={doc}
            isConverting={carregandoId === doc.id}
            onConvert={handleConvert}
            onDownload={baixar}
            onRemove={remover}
          />
        ))}

        {documentos.length === 0 && (
          <p className="vazio">Seus documentos aparecerão aqui.</p>
        )}
      </section>

      {/* Req: Botão de validação no final da tela (sem o card FooterInfo abaixo) */}
      <div className="home-validar-wrapper">
        <button
          type="button"
          className="home-validar-btn"
          onClick={() => {
            validarDocumentos();
            setCurrentView("validation");
          }}
          disabled={documentos.length === 0}
          title={
            documentos.length === 0
              ? "Adicione documentos para validar"
              : "Validar integridade dos documentos"
          }
        >
          <ShieldCheck size={20} />
          Validar documentos
        </button>
      </div>

      {/* Req 3: FooterInfo (card) removido */}
    </main>
  );
}