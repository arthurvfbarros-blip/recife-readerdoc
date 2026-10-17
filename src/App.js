import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { FileUpload } from "./components/FileUpload";
import { DocumentItem } from "./components/DocumentItem";
import { FooterInfo } from "./components/FooterInfo";
import { useDocumentManager } from "./hooks/useDocumentManager";
import "./index.css";

export default function App() {
  const {
    documentos,
    carregandoId,
    adicionarArquivos,
    converter,
    baixar,
    remover,
  } = useDocumentManager();

  return (
    <main className="app">
      <Header />
      <Hero />

      <section className="painel">
        <h2>Inserir documentos</h2>
        <p>Aceitamos arquivos PDF, JPG e PNG.</p>

        <FileUpload onFilesSelected={adicionarArquivos} />

        <div className="cabecalho-lista">
          <h3>Meus documentos</h3>
          <span>{documentos.length} arquivo(s)</span>
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