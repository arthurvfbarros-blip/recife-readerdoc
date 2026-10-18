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

/** Uma linha de texto do documento, já separada em colunas quando parece uma tabela */
export interface LinhaExtraida {
  pagina: number;
  numero: number; // posição da linha dentro da página
  texto: string;
  colunas: string[];
}

/** Pares "Campo: Valor" encontrados no texto (ex.: "Nome: Maria") */
export interface CampoExtraido {
  campo: string;
  valor: string;
  pagina: number;
}

/** Req 2: conteúdo real lido do documento */
export interface DadosExtraidos {
  origem: "texto-pdf" | "ocr";
  totalPaginas: number;
  linhas: LinhaExtraida[];
  campos: CampoExtraido[];
}

export interface Documento {
  id: string;
  nome: string;
  arquivo: File;
  status: DocumentoStatus;
  pdf?: Blob;
  dados?: DadosExtraidos; // preenchido ao converter
  validacao?: DocumentoValidacao;
}
