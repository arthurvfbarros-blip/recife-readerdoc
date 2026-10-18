import React, { useEffect } from "react";
import { ArrowLeft, Check, X, RefreshCw } from "lucide-react";
import { Documento } from "../types/documento";

interface ValidationViewProps {
  documentos: Documento[];
  validando: boolean;
  onValidate: () => Promise<void>;
  onBack: () => void;
}

export function ValidationView({
  documentos,
  validando,
  onValidate,
  onBack,
}: ValidationViewProps) {
  // Executa a validação automaticamente ao entrar na tela se ainda não foi executada
  useEffect(() => {
    const precisaValidar = documentos.some((doc) => doc.validacao === undefined);
    if (precisaValidar && !validando && documentos.length > 0) {
      onValidate();
    }
  }, [documentos, validando, onValidate]);

  const temInvalido = documentos.some((doc) => doc.validacao && !doc.validacao.valido);
  const todosValidados = documentos.length > 0 && documentos.every((doc) => doc.validacao !== undefined);

  return (
    <div className="validacao-screen">
      <header className="validacao-topbar">
        <button
          type="button"
          className="validacao-back-btn"
          onClick={onBack}
          aria-label="Voltar"
        >
          <ArrowLeft size={32} />
        </button>
        <h1 className="validacao-title">Recife ReaderDoc</h1>
      </header>

      <main className="validacao-content">
        {validando && (
          <div className="validacao-loading">
            <RefreshCw className="spinner" size={32} />
            <p>Validando integridade dos documentos...</p>
          </div>
        )}

        {documentos.length === 0 ? (
          <div className="validacao-vazio">
            <p>Nenhum documento para validar. Insira documentos na página inicial.</p>
            <button type="button" onClick={onBack} className="btn-voltar-home">
              Inserir documentos
            </button>
          </div>
        ) : (
          <div className="validacao-grid">
            {documentos.map((doc, index) => {
              const ehValido = doc.validacao?.valido ?? true;
              const nomeExibicao = doc.nome || `Ficheiro ${index + 1}`;

              return (
                <div key={doc.id} className="ficheiro-item">
                  <div
                    className={`ficheiro-card ${ehValido ? "valido" : "invalido"}`}
                    title={doc.validacao?.motivo || doc.nome}
                  >
                    <div className={`status-badge-circulo ${ehValido ? "badge-verde" : "badge-vermelho"}`}>
                      {ehValido ? (
                        <Check size={42} strokeWidth={3.5} />
                      ) : (
                        <X size={42} strokeWidth={3.5} />
                      )}
                    </div>
                  </div>
                  <span className="ficheiro-nome" title={doc.nome}>
                    {nomeExibicao.length > 20
                      ? `Ficheiro ${index + 1}`
                      : nomeExibicao}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {todosValidados && temInvalido && (
          <p className="mensagem-invalido">
            Documento inválido, informações incorretas
          </p>
        )}

        {todosValidados && !temInvalido && (
          <p className="mensagem-valido">
            Todos os documentos foram validados com sucesso!
          </p>
        )}
      </main>
    </div>
  );
}
