import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import type { PerfilEmpresa } from '@/lib/api';

const UFS = ['AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO'];

interface CompanyProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: PerfilEmpresa;
  onSave: (profile: PerfilEmpresa) => void;
}

export function CompanyProfileDialog({ open, onOpenChange, profile, onSave }: CompanyProfileDialogProps) {
  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    onSave({
      porte: fd.get('porte') as string,
      segmento: fd.get('segmento') as string,
      uf: fd.get('uf') as string,
      experiencia: fd.get('experiencia') as string,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Perfil da Empresa</DialogTitle>
          <DialogDescription>Configure o perfil para análises personalizadas de cada licitação.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="porte">Porte</Label>
            <Select name="porte" defaultValue={profile.porte}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="MEI">MEI</SelectItem>
                <SelectItem value="Microempresa">Microempresa</SelectItem>
                <SelectItem value="Pequena">Pequena Empresa</SelectItem>
                <SelectItem value="Média">Média Empresa</SelectItem>
                <SelectItem value="Grande">Grande Empresa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="segmento">Segmento de atuação</Label>
            <Input name="segmento" defaultValue={profile.segmento} placeholder="Ex: Tecnologia, Construção, Saúde..." />
          </div>

          <div className="space-y-2">
            <Label htmlFor="uf">Estado (UF)</Label>
            <Select name="uf" defaultValue={profile.uf}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {UFS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="experiencia">Experiência em licitações</Label>
            <Select name="experiencia" defaultValue={profile.experiencia}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Iniciante">Iniciante (nunca participou)</SelectItem>
                <SelectItem value="Pouca">Pouca (1-5 licitações)</SelectItem>
                <SelectItem value="Moderada">Moderada (5-20 licitações)</SelectItem>
                <SelectItem value="Experiente">Experiente (20+ licitações)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full bg-primary text-primary-foreground">Salvar perfil</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
