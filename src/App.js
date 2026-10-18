import { useState } from "react";
import { Download, ShieldCheck } from "lucide-react";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { FileUpload } from "./components/FileUpload";
import { DocumentItem } from "./components/DocumentItem";
import { FooterInfo } from "./components/FooterInfo";
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
          documentCount={documentos.length}
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

          {documentos.length > 0 && (
            <div className="acoes-lista">
              <button
                type="button"
                className="btn-acao secundario"
                onClick={() => setCurrentView("export")}
                title="Ir para tela de exportação"
              >
                <Download size={16} />
                Exportar
              </button>

              <button
                type="button"
                className="btn-acao"
                onClick={() => {
                  validarDocumentos();
                  setCurrentView("validation");
                }}
                title="Validar integridade dos documentos"
              >
                <ShieldCheck size={16} />
                Validar documentos
              </button>
            </div>
          )}
        </div>

        {documentos.map((doc) => (
          <DocumentItem
            key={doc.id}
            documento={doc}
            isConverting={carregandoId === doc.id}
            onConvert={converter}
            onDownload={baixar}
            onRemove={remover}
          />
        ))}

        {documentos.length === 0 && (
          <p className="vazio">Seus documentos aparecerão aqui.</p>
        )}
      </section>

      <FooterInfo />
    </main>
  );
}