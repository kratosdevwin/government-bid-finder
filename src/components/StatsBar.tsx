import { FileSearch, Clock, TrendingUp, Database } from 'lucide-react';

interface StatsBarProps {
  totalResults: number;
  isMock: boolean;
}

export function StatsBar({ totalResults, isMock }: StatsBarProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {[
        { icon: FileSearch, label: 'Licitações encontradas', value: totalResults.toLocaleString('pt-BR'), color: 'text-primary' },
        { icon: Clock, label: 'Atualizações', value: 'Tempo real', color: 'text-info' },
        { icon: TrendingUp, label: 'Análises IA', value: 'Ilimitadas', color: 'text-success' },
        { icon: Database, label: 'Fonte', value: isMock ? 'Demo (PNCP)' : 'PNCP Oficial', color: 'text-warning' },
      ].map(({ icon: Icon, label, value, color }) => (
        <div key={label} className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border">
          <Icon className={`h-5 w-5 ${color} shrink-0`} />
          <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-sm font-semibold">{value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
