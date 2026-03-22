import { X, TrendingUp, TrendingDown, Shield, Target, Lightbulb, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Licitacao, AnaliseResult } from '@/lib/api';

interface AnalysisPanelProps {
  licitacao: Licitacao;
  analysis: AnaliseResult | null;
  isLoading: boolean;
  error: string | null;
  onClose: () => void;
}

function ScoreRing({ score }: { score: number }) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 70 ? 'hsl(var(--success))' : score >= 40 ? 'hsl(var(--warning))' : 'hsl(var(--destructive))';

  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="hsl(var(--border))" strokeWidth="6" />
        <circle
          cx="50" cy="50" r={radius} fill="none" stroke={color}
          strokeWidth="6" strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <span className="absolute text-2xl font-bold font-mono" style={{ color }}>{score}</span>
    </div>
  );
}

function RiskBadge({ level }: { level: string }) {
  const config = {
    baixo: { label: 'Risco Baixo', className: 'bg-success/10 text-success border-success/20' },
    medio: { label: 'Risco Médio', className: 'bg-warning/10 text-warning border-warning/20' },
    alto: { label: 'Risco Alto', className: 'bg-destructive/10 text-destructive border-destructive/20' },
  }[level] || { label: level, className: '' };

  return <Badge variant="outline" className={`${config.className} font-medium`}>{config.label}</Badge>;
}

export function AnalysisPanel({ licitacao, analysis, isLoading, error, onClose }: AnalysisPanelProps) {
  return (
    <div className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm flex justify-end animate-fade-in">
      <div className="w-full max-w-xl bg-card shadow-2xl overflow-y-auto animate-reveal" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-card/95 backdrop-blur-sm border-b border-border p-4 flex items-center justify-between z-10">
          <h2 className="font-semibold text-lg">Análise com IA</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Licitação summary */}
          <div className="p-4 bg-muted/50 rounded-lg space-y-1">
            <p className="text-sm font-medium line-clamp-2">{licitacao.objetoCompra}</p>
            <p className="text-xs text-muted-foreground">{licitacao.orgaoEntidade.razaoSocial} · {licitacao.ufSigla}</p>
            <p className="text-sm font-bold font-mono text-primary">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(licitacao.valorTotalEstimado)}
            </p>
          </div>

          {isLoading && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Analisando licitação com inteligência artificial...</p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-destructive/10 rounded-lg flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-destructive">Erro na análise</p>
                <p className="text-xs text-destructive/80 mt-1">{error}</p>
              </div>
            </div>
          )}

          {analysis && (
            <div className="space-y-6 animate-reveal-up">
              {/* Score and Risk */}
              <div className="flex items-center gap-6">
                <ScoreRing score={analysis.scoreGeral} />
                <div className="space-y-2">
                  <RiskBadge level={analysis.risco} />
                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-xs">
                      Complexidade: {analysis.complexidade}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Concorrência: {analysis.concorrenciaEstimada}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{analysis.estimativaLucro}</p>
                </div>
              </div>

              {/* Recomendação */}
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold">Recomendação</span>
                </div>
                <p className="text-sm leading-relaxed">{analysis.recomendacao}</p>
              </div>

              {/* Vantagens */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="h-4 w-4 text-success" />
                  <span className="text-sm font-semibold">Vantagens</span>
                </div>
                <ul className="space-y-2">
                  {analysis.vantagens.map((v, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                      <span>{v}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Desvantagens */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <TrendingDown className="h-4 w-4 text-destructive" />
                  <span className="text-sm font-semibold">Desvantagens</span>
                </div>
                <ul className="space-y-2">
                  {analysis.desvantagens.map((d, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Requisitos */}
              {analysis.requisitosChave.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="h-4 w-4 text-info" />
                    <span className="text-sm font-semibold">Requisitos-chave</span>
                  </div>
                  <ul className="space-y-1.5">
                    {analysis.requisitosChave.map((r, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-info mt-1">•</span> {r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Dicas */}
              {analysis.dicasEstrategicas.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Lightbulb className="h-4 w-4 text-warning" />
                    <span className="text-sm font-semibold">Dicas Estratégicas</span>
                  </div>
                  <ul className="space-y-1.5">
                    {analysis.dicasEstrategicas.map((d, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-warning mt-1">•</span> {d}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
