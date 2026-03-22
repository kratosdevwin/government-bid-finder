import { useState, useEffect } from 'react';
import type { PerfilEmpresa } from '@/lib/api';

const STORAGE_KEY = 'licitacao-perfil-empresa';

const defaultProfile: PerfilEmpresa = {
  porte: 'Pequena',
  segmento: '',
  uf: '',
  experiencia: 'Iniciante',
};

export function useCompanyProfile() {
  const [profile, setProfile] = useState<PerfilEmpresa>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : defaultProfile;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  }, [profile]);

  return { profile, setProfile };
}
