import { Building2, Calendar, MapPin, Tag, ArrowRight, FileText } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Licitacao } from '@/lib/api';

interface LicitacaoCardProps {
  licitacao: Licitacao;
  onAnalyze: (licitacao: Licitacao) => void;
  index: number;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function getDaysUntil(dateStr: string) {
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function LicitacaoCard({ licitacao, onAnalyze, index }: LicitacaoCardProps) {
  const daysLeft = getDaysUntil(licitacao.dataAbertura);
  const urgency = daysLeft <= 3 ? 'urgent' : daysLeft <= 7 ? 'soon' : 'normal';

  return (
    <Card
      className="p-5 hover:shadow-lg transition-shadow duration-200 border-border bg-card group"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="flex flex-col gap-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <Badge variant="outline" className="text-xs font-medium shrink-0">
                {licitacao.modalidadeNome}
              </Badge>
              {licitacao.srp && (
                <Badge variant="secondary" className="text-xs shrink-0">SRP</Badge>
              )}
              {urgency === 'urgent' && (
                <Badge className="text-xs bg-destructive text-destructive-foreground shrink-0">
                  Encerra em {daysLeft}d
                </Badge>
              )}
              {urgency === 'soon' && (
                <Badge className="text-xs bg-warning text-warning-foreground shrink-0">
                  {daysLeft} dias
                </Badge>
              )}
            </div>
            <p className="text-sm font-medium leading-snug line-clamp-2 text-foreground">
              {licitacao.objetoCompra}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-lg font-bold text-primary font-mono tracking-tight">
              {formatCurrency(licitacao.valorTotalEstimado)}
            </p>
            <p className="text-xs text-muted-foreground">Valor estimado</p>
          </div>
        </div>

        {/* Meta */}
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Building2 className="h-3.5 w-3.5" />
            {licitacao.orgaoEntidade.razaoSocial}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {licitacao.ufSigla}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            Abertura: {formatDate(licitacao.dataAbertura)}
          </span>
          <span className="flex items-center gap-1">
            <Tag className="h-3.5 w-3.5" />
            Nº {licitacao.numeroCompra}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1">
          <Button
            size="sm"
            onClick={() => onAnalyze(licitacao)}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Analisar com IA <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </Button>
          {licitacao.linkEdital && (
            <Button
              variant="outline"
              size="sm"
              asChild
            >
              <a href={licitacao.linkEdital} target="_blank" rel="noopener noreferrer">
                <FileText className="h-3.5 w-3.5 mr-1" /> Ver Edital
              </a>
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
