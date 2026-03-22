import { useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { SearchParams } from '@/lib/api';

const UFS = ['AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO'];
const MODALIDADES = ['Pregão Eletrônico', 'Concorrência', 'Tomada de Preços', 'Dispensa de Licitação', 'Pregão Presencial', 'Convite'];

interface SearchBarProps {
  onSearch: (params: SearchParams) => void;
  isLoading: boolean;
}

export function SearchBar({ onSearch, isLoading }: SearchBarProps) {
  const [termo, setTermo] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [uf, setUf] = useState('');
  const [modalidade, setModalidade] = useState('');

  const handleSearch = () => {
    onSearch({
      termo: termo || undefined,
      uf: uf || undefined,
      modalidade: modalidade || undefined,
    });
  };

  const clearFilters = () => {
    setUf('');
    setModalidade('');
  };

  const hasFilters = uf || modalidade;

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar licitações por palavra-chave, órgão, objeto..."
            value={termo}
            onChange={(e) => setTermo(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-10 h-12 text-base bg-card border-border"
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          className={`h-12 w-12 shrink-0 ${showFilters ? 'bg-primary text-primary-foreground' : ''}`}
          onClick={() => setShowFilters(!showFilters)}
        >
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
        <Button onClick={handleSearch} disabled={isLoading} className="h-12 px-8 bg-primary text-primary-foreground hover:bg-primary/90">
          {isLoading ? 'Buscando...' : 'Buscar'}
        </Button>
      </div>

      {showFilters && (
        <div className="flex flex-wrap gap-3 p-4 bg-card rounded-lg border border-border animate-reveal-up">
          <Select value={uf} onValueChange={setUf}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Estado (UF)" />
            </SelectTrigger>
            <SelectContent>
              {UFS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={modalidade} onValueChange={setModalidade}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Modalidade" />
            </SelectTrigger>
            <SelectContent>
              {MODALIDADES.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
            </SelectContent>
          </Select>

          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
              <X className="h-3 w-3 mr-1" /> Limpar filtros
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
