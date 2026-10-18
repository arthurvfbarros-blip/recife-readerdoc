export type DocumentoStatus =
  | "PDF pronto"
  | "Aguardando conversão"
  | "Convertendo..."
  | "Convertido com sucesso"
  | "Erro na conversão"
  | "Formato não suportado";

export interface DocumentoValidacao {
  valido: boolean;
  motivo?: string;
}

export interface Documento {
  id: string;
  nome: string;
  arquivo: File;
  status: DocumentoStatus;
  pdf?: Blob;
  validacao?: DocumentoValidacao;
}