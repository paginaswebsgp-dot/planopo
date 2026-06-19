import type { Metadata } from 'next';
import { ThemeProvider } from '@/components/ThemeProvider';
import { UserProvider } from '@/components/auth/UserProvider';
import Navbar from '@/components/Navbar';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'PlanOpo — Planificador de Oposiciones', template: '%s | PlanOpo' },
  description: 'Genera tu calendario de estudio para oposiciones automáticamente. Planificador con repasos espaciados, simulacros y seguimiento de progreso.',
  keywords: ['planificador oposiciones', 'calendario oposiciones', 'organizar estudio oposiciones'],
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <UserProvider>
            <Navbar />
            <main style={{ minHeight: 'calc(100vh - 56px)' }}>{children}</main>
            <footer style={{ borderTop: '1px solid var(--card-border)', padding: '32px 16px', background: 'var(--secondary)' }}>
              <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20, marginBottom: 24 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ color: 'white', fontSize: 13, fontWeight: 700 }}>P</span>
                    </div>
                    <span style={{ fontWeight: 700, fontSize: 16 }}>PlanOpo</span>
                  </div>
                  <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                    {[
                      { href: '/', label: 'Inicio' },
                      { href: '/precios', label: 'Precios' },
                      { href: '/contacto', label: 'Contacto' },
                      { href: '/auth/login', label: 'Entrar' },
                      { href: '/auth/registro', label: 'Registrarse' },
                    ].map(({ href, label }) => (
                      <a key={href} href={href} style={{ fontSize: 13, color: 'var(--muted)', textDecoration: 'none' }}>{label}</a>
                    ))}
                  </div>
                </div>
                <div style={{ borderTop: '1px solid var(--card-border)', paddingTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                  <p style={{ fontSize: 12, color: 'var(--muted)' }}>
                    © {new Date().getFullYear()} PlanOpo · Tu planificador de oposiciones
                  </p>
                  <a href="mailto:paginaswebsgp@gmail.com" style={{ fontSize: 12, color: 'var(--primary)', textDecoration: 'none' }}>
                    ✉️ paginaswebsgp@gmail.com
                  </a>
                </div>
              </div>
            </footer>
          </UserProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
