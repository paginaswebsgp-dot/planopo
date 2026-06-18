'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

interface Perfil {
  id: string;
  es_premium: boolean;
  exportaciones_pdf: number;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  premium_desde: string | null;
}

interface UserContextType {
  user: User | null;
  perfil: Perfil | null;
  cargando: boolean;
  esPremium: boolean;
  puedeExportarPDF: boolean;
  exportacionesRestantes: number;
  refrescar: () => void;
  logout: () => Promise<void>;
}

const UserContext = createContext<UserContextType>({
  user: null, perfil: null, cargando: true,
  esPremium: false, puedeExportarPDF: false, exportacionesRestantes: 0,
  refrescar: () => {}, logout: async () => {},
});

const MAX_PDF_GRATIS = 2;

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [cargando, setCargando] = useState(true);

  async function cargar() {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user ?? null);

    if (session?.user) {
      try {
        const res = await fetch('/api/user');
        const data = await res.json();
        setPerfil(data.perfil);
      } catch {
        setPerfil(null);
      }
    } else {
      setPerfil(null);
    }
    setCargando(false);
  }

  useEffect(() => {
    cargar();

    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetch('/api/user').then(r => r.json()).then(d => setPerfil(d.perfil)).catch(() => setPerfil(null));
      } else {
        setPerfil(null);
      }
      setCargando(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/';
  }

  const esPremium = perfil?.es_premium ?? false;
  const exportacionesUsadas = perfil?.exportaciones_pdf ?? 0;
  const exportacionesRestantes = esPremium ? Infinity : Math.max(0, MAX_PDF_GRATIS - exportacionesUsadas);
  const puedeExportarPDF = esPremium || exportacionesRestantes > 0;

  return (
    <UserContext.Provider value={{
      user, perfil, cargando, esPremium,
      puedeExportarPDF, exportacionesRestantes,
      refrescar: cargar, logout,
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
