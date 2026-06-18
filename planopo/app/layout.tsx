import type { Metadata } from 'next';
import { ThemeProvider } from '@/components/ThemeProvider';
import Navbar from '@/components/Navbar';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'PlanOpo — Planificador de Oposiciones',
    template: '%s | PlanOpo',
  },
  description:
    'Genera tu calendario de estudio para oposiciones automáticamente. Planificador inteligente con repasos espaciados, simulacros y seguimiento de progreso.',
  keywords: [
    'planificador oposiciones',
    'calendario oposiciones',
    'organizar estudio oposiciones',
    'planificación oposición policía',
    'planificación oposición educación',
    'planificación oposición justicia',
  ],
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <Navbar />
          <main style={{ minHeight: 'calc(100vh - 56px)' }}>
            {children}
          </main>
          <footer style={{
            borderTop: '1px solid var(--card-border)',
            padding: '24px 16px',
            textAlign: 'center',
          }}>
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <div style={{
                  width: 22, height: 22, borderRadius: 6,
                  background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ color: 'white', fontSize: 11, fontWeight: 700 }}>P</span>
                </div>
                <span style={{ fontWeight: 700, fontSize: 14 }}>PlanOpo</span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--muted)' }}>
                © {new Date().getFullYear()} PlanOpo · Tu planificador de oposiciones ·{' '}
                <a href="/precios" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Precios</a>
              </p>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
