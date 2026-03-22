import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const PNCP_BASE = 'https://pncp.gov.br/api/consulta/v1';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { termo, uf, modalidade, dataInicial, dataFinal, pagina = 1, tamanho = 20 } = await req.json();

    const params = new URLSearchParams();
    if (termo) params.set('q', termo);
    if (uf) params.set('uf', uf);
    if (modalidade) params.set('modalidade', modalidade);
    if (dataInicial) params.set('dataInicial', dataInicial);
    if (dataFinal) params.set('dataFinal', dataFinal);
    params.set('pagina', String(pagina));
    params.set('tamanhoPagina', String(tamanho));
    params.set('status', 'aberta');
    params.set('ordenacao', '-dataPublicacaoPncp');

    const url = `${PNCP_BASE}/contratacoes/publicacao?${params.toString()}`;
    console.log('Fetching PNCP:', url);

    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('PNCP error:', response.status, errorText);
      
      // If the PNCP API fails, return mock data for demonstration
      const mockData = generateMockData(termo, uf, pagina);
      return new Response(JSON.stringify(mockData), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    // Return mock data on any error
    const mockData = generateMockData('', '', 1);
    return new Response(JSON.stringify(mockData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generateMockData(termo: string, uf: string, pagina: number) {
  const orgaos = [
    'Ministério da Saúde', 'Prefeitura de São Paulo', 'INSS - Instituto Nacional do Seguro Social',
    'Universidade Federal do Rio de Janeiro', 'Tribunal Regional do Trabalho - 2ª Região',
    'Secretaria de Educação do Estado de Minas Gerais', 'IBGE - Instituto Brasileiro de Geografia e Estatística',
    'Empresa Brasileira de Correios e Telégrafos', 'Câmara Municipal de Belo Horizonte',
    'Fundação Oswaldo Cruz - Fiocruz'
  ];

  const objetos = [
    'Aquisição de equipamentos de informática incluindo computadores, monitores e periféricos',
    'Contratação de serviços de limpeza e conservação predial',
    'Fornecimento de materiais de escritório e papelaria',
    'Prestação de serviços de manutenção preventiva e corretiva de ar condicionado',
    'Aquisição de medicamentos e insumos hospitalares',
    'Contratação de empresa especializada em desenvolvimento de sistemas',
    'Serviço de vigilância armada e desarmada patrimonial',
    'Aquisição de veículos automotores tipo sedan e utilitários',
    'Contratação de serviços de telecomunicação e internet',
    'Fornecimento de mobiliário escolar - carteiras, mesas e cadeiras',
    'Obras de reforma e ampliação de unidade básica de saúde',
    'Contratação de serviços de consultoria em gestão pública',
  ];

  const modalidades = ['Pregão Eletrônico', 'Concorrência', 'Tomada de Preços', 'Dispensa de Licitação', 'Pregão Presencial'];
  const ufs = ['SP', 'RJ', 'MG', 'DF', 'BA', 'PR', 'RS', 'PE', 'CE', 'GO'];

  const items = Array.from({ length: 12 }, (_, i) => {
    const valor = Math.random() * 5000000 + 10000;
    const dataBase = new Date();
    dataBase.setDate(dataBase.getDate() + Math.floor(Math.random() * 30));
    const dataPublicacao = new Date();
    dataPublicacao.setDate(dataPublicacao.getDate() - Math.floor(Math.random() * 10));

    return {
      id: `${pagina}-${i}-${Date.now()}`,
      orgaoEntidade: { razaoSocial: orgaos[i % orgaos.length], cnpj: `${String(i + 10).padStart(2, '0')}.${String(Math.floor(Math.random() * 999)).padStart(3, '0')}.${String(Math.floor(Math.random() * 999)).padStart(3, '0')}/0001-${String(Math.floor(Math.random() * 99)).padStart(2, '0')}` },
      objetoCompra: objetos[i % objetos.length],
      valorTotalEstimado: valor,
      modalidadeNome: modalidades[Math.floor(Math.random() * modalidades.length)],
      ufSigla: uf || ufs[Math.floor(Math.random() * ufs.length)],
      municipio: 'Brasília',
      dataPublicacaoPncp: dataPublicacao.toISOString(),
      dataAbertura: dataBase.toISOString(),
      numeroCompra: `${Math.floor(Math.random() * 9000) + 1000}/${new Date().getFullYear()}`,
      situacaoCompra: 'Aberta',
      linkEdital: `https://pncp.gov.br/app/editais/${pagina}${i}`,
      srp: Math.random() > 0.6,
    };
  });

  return {
    data: items,
    totalRegistros: 156,
    totalPaginas: 13,
    paginaAtual: pagina,
    mock: true,
  };
}