import { useState, useCallback } from 'react';
import { Building2, Settings2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SearchBar } from '@/components/SearchBar';
import { LicitacaoCard } from '@/components/LicitacaoCard';
import { AnalysisPanel } from '@/components/AnalysisPanel';
import { CompanyProfileDialog } from '@/components/CompanyProfileDialog';
import { StatsBar } from '@/components/StatsBar';
import { useCompanyProfile } from '@/hooks/useCompanyProfile';
import { searchLicitacoes, analyzeLicitacao } from '@/lib/api';
import type { Licitacao, AnaliseResult, SearchParams, SearchResult } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const { toast } = useToast();
  const { profile, setProfile } = useCompanyProfile();
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedLicitacao, setSelectedLicitacao] = useState<Licitacao | null>(null);
  const [analysis, setAnalysis] = useState<AnaliseResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const handleSearch = useCallback(async (params: SearchParams) => {
    setIsSearching(true);
    try {
      const result = await searchLicitacoes(params);
      setSearchResult(result);
      if (result.mock) {
        toast({
          title: 'Dados de demonstração',
          description: 'A API do PNCP está indisponível. Exibindo dados simulados para demonstração.',
        });
      }
    } catch (err) {
      toast({ title: 'Erro na busca', description: String(err), variant: 'destructive' });
    } finally {
      setIsSearching(false);
    }
  }, [toast]);

  const handleAnalyze = useCallback(async (licitacao: Licitacao) => {
    setSelectedLicitacao(licitacao);
    setAnalysis(null);
    setAnalysisError(null);
    setIsAnalyzing(true);
    try {
      const result = await analyzeLicitacao(licitacao, profile);
      setAnalysis(result);
    } catch (err) {
      setAnalysisError(String(err));
    } finally {
      setIsAnalyzing(false);
    }
  }, [profile]);

  const closeAnalysis = () => {
    setSelectedLicitacao(null);
    setAnalysis(null);
    setAnalysisError(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-base font-bold leading-none tracking-tight">LicitaIA</h1>
              <p className="text-[10px] text-muted-foreground leading-none mt-0.5">Busca & Análise Inteligente</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => setProfileOpen(true)} className="gap-1.5">
            <Settings2 className="h-3.5 w-3.5" />
            Perfil da Empresa
          </Button>
        </div>
      </header>

      <main className="container max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Hero */}
        <section className="text-center space-y-4 py-8 animate-reveal">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-xs font-medium text-primary">
            <Building2 className="h-3 w-3" />
            Portal Nacional de Contratações Públicas
          </div>
          <h2 className="text-3xl md:text-4xl font-bold leading-tight" style={{ lineHeight: '1.1' }}>
            Encontre licitações e descubra<br />
            <span className="text-primary">se vale a pena concorrer</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm leading-relaxed">
            Busque em tempo real nas bases públicas do governo. A IA analisa cada oportunidade 
            e indica vantagens, riscos e estratégias para sua empresa.
          </p>
        </section>

        {/* Search */}
        <section className="animate-reveal" style={{ animationDelay: '100ms' }}>
          <SearchBar onSearch={handleSearch} isLoading={isSearching} />
        </section>

        {/* Results */}
        {searchResult && (
          <section className="space-y-4 animate-reveal-up">
            <StatsBar totalResults={searchResult.totalRegistros} isMock={!!searchResult.mock} />
            
            <div className="space-y-3">
              {searchResult.data.map((licitacao, i) => (
                <LicitacaoCard
                  key={licitacao.id}
                  licitacao={licitacao}
                  onAnalyze={handleAnalyze}
                  index={i}
                />
              ))}
            </div>

            {searchResult.data.length === 0 && (
              <div className="text-center py-16">
                <p className="text-muted-foreground">Nenhuma licitação encontrada. Tente outros termos ou filtros.</p>
              </div>
            )}
          </section>
        )}

        {/* Empty state */}
        {!searchResult && !isSearching && (
          <section className="text-center py-16 animate-fade-in" style={{ animationDelay: '200ms' }}>
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <Building2 className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-sm">
              Faça uma busca para encontrar licitações abertas no Portal Nacional de Contratações Públicas
            </p>
          </section>
        )}
      </main>

      {/* Analysis Panel */}
      {selectedLicitacao && (
        <AnalysisPanel
          licitacao={selectedLicitacao}
          analysis={analysis}
          isLoading={isAnalyzing}
          error={analysisError}
          onClose={closeAnalysis}
        />
      )}

      {/* Company Profile Dialog */}
      <CompanyProfileDialog
        open={profileOpen}
        onOpenChange={setProfileOpen}
        profile={profile}
        onSave={setProfile}
      />
    </div>
  );
};

export default Index;
