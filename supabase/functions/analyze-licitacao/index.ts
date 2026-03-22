import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { licitacao, perfilEmpresa } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `Você é um especialista em licitações públicas brasileiras. Analise a licitação fornecida considerando o perfil da empresa e retorne uma análise detalhada.

Responda SEMPRE em formato JSON com a seguinte estrutura:
{
  "scoreGeral": número de 0 a 100 representando a atratividade geral,
  "risco": "baixo" | "medio" | "alto",
  "vantagens": [lista de strings com vantagens de concorrer],
  "desvantagens": [lista de strings com desvantagens/riscos],
  "recomendacao": "string com recomendação clara se deve ou não concorrer",
  "estimativaLucro": "string com estimativa de margem de lucro",
  "complexidade": "baixa" | "media" | "alta",
  "concorrenciaEstimada": "baixa" | "media" | "alta",
  "requisitosChave": [lista de requisitos importantes para participar],
  "dicasEstrategicas": [lista de dicas para aumentar chances de vencer]
}

Considere fatores como:
- Valor e margens do contrato
- Complexidade do objeto
- Modalidade e concorrência esperada
- Localização e logística
- Prazo de execução
- Requisitos técnicos
- Perfil e porte da empresa candidata
- Histórico de contratos similares no mercado`;

    const userPrompt = `Analise esta licitação:
Órgão: ${licitacao.orgaoEntidade?.razaoSocial || 'Não informado'}
Objeto: ${licitacao.objetoCompra || 'Não informado'}
Valor estimado: R$ ${licitacao.valorTotalEstimado?.toLocaleString('pt-BR') || 'Não informado'}
Modalidade: ${licitacao.modalidadeNome || 'Não informado'}
UF: ${licitacao.ufSigla || 'Não informado'}
Data abertura: ${licitacao.dataAbertura || 'Não informado'}
SRP: ${licitacao.srp ? 'Sim' : 'Não'}

Perfil da empresa:
Porte: ${perfilEmpresa?.porte || 'Não informado'}
Segmento: ${perfilEmpresa?.segmento || 'Não informado'}
UF da empresa: ${perfilEmpresa?.uf || 'Não informado'}
Experiência em licitações: ${perfilEmpresa?.experiencia || 'Não informado'}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        tools: [{
          type: 'function',
          function: {
            name: 'analise_licitacao',
            description: 'Retorna análise estruturada de uma licitação',
            parameters: {
              type: 'object',
              properties: {
                scoreGeral: { type: 'number', description: 'Score de 0 a 100' },
                risco: { type: 'string', enum: ['baixo', 'medio', 'alto'] },
                vantagens: { type: 'array', items: { type: 'string' } },
                desvantagens: { type: 'array', items: { type: 'string' } },
                recomendacao: { type: 'string' },
                estimativaLucro: { type: 'string' },
                complexidade: { type: 'string', enum: ['baixa', 'media', 'alta'] },
                concorrenciaEstimada: { type: 'string', enum: ['baixa', 'media', 'alta'] },
                requisitosChave: { type: 'array', items: { type: 'string' } },
                dicasEstrategicas: { type: 'array', items: { type: 'string' } },
              },
              required: ['scoreGeral', 'risco', 'vantagens', 'desvantagens', 'recomendacao', 'estimativaLucro', 'complexidade', 'concorrenciaEstimada', 'requisitosChave', 'dicasEstrategicas'],
            },
          },
        }],
        tool_choice: { type: 'function', function: { name: 'analise_licitacao' } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Limite de requisições excedido. Tente novamente em alguns instantes.' }), {
          status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Créditos insuficientes. Adicione créditos em Settings > Workspace > Usage.' }), {
          status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiData = await response.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    
    if (toolCall?.function?.arguments) {
      const analysis = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify({ success: true, analysis }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fallback: try to parse content directly
    const content = aiData.choices?.[0]?.message?.content;
    if (content) {
      try {
        const analysis = JSON.parse(content);
        return new Response(JSON.stringify({ success: true, analysis }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch {
        return new Response(JSON.stringify({ success: true, analysis: { recomendacao: content, scoreGeral: 50, risco: 'medio', vantagens: [], desvantagens: [], estimativaLucro: 'Não calculado', complexidade: 'media', concorrenciaEstimada: 'media', requisitosChave: [], dicasEstrategicas: [] } }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    throw new Error('Resposta inesperada da IA');
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Erro desconhecido' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
