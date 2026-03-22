import { supabase } from '@/integrations/supabase/client';

export interface Licitacao {
  id: string;
  orgaoEntidade: { razaoSocial: string; cnpj: string };
  objetoCompra: string;
  valorTotalEstimado: number;
  modalidadeNome: string;
  ufSigla: string;
  municipio: string;
  dataPublicacaoPncp: string;
  dataAbertura: string;
  numeroCompra: string;
  situacaoCompra: string;
  linkEdital: string;
  srp: boolean;
}

export interface SearchParams {
  termo?: string;
  uf?: string;
  modalidade?: string;
  dataInicial?: string;
  dataFinal?: string;
  pagina?: number;
  tamanho?: number;
}

export interface SearchResult {
  data: Licitacao[];
  totalRegistros: number;
  totalPaginas: number;
  paginaAtual: number;
  mock?: boolean;
}

export interface PerfilEmpresa {
  porte: string;
  segmento: string;
  uf: string;
  experiencia: string;
}

export interface AnaliseResult {
  scoreGeral: number;
  risco: 'baixo' | 'medio' | 'alto';
  vantagens: string[];
  desvantagens: string[];
  recomendacao: string;
  estimativaLucro: string;
  complexidade: 'baixa' | 'media' | 'alta';
  concorrenciaEstimada: 'baixa' | 'media' | 'alta';
  requisitosChave: string[];
  dicasEstrategicas: string[];
}

export async function searchLicitacoes(params: SearchParams): Promise<SearchResult> {
  const { data, error } = await supabase.functions.invoke('search-licitacoes', {
    body: params,
  });

  if (error) throw new Error(error.message);
  return data;
}

export async function analyzeLicitacao(licitacao: Licitacao, perfilEmpresa: PerfilEmpresa): Promise<AnaliseResult> {
  const { data, error } = await supabase.functions.invoke('analyze-licitacao', {
    body: { licitacao, perfilEmpresa },
  });

  if (error) throw new Error(error.message);
  if (data.error) throw new Error(data.error);
  return data.analysis;
}
