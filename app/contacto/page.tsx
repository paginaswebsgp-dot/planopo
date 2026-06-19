import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Contacto — PlanOpo',
  description: 'Contacta con el equipo de PlanOpo para cualquier duda o sugerencia.',
};

export default function ContactoPage() {
  return (
    <div style={{ background: 'var(--secondary)', minHeight: 'calc(100vh - 56px)', padding: '64px 16px' }}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 16, margin: '0 auto 16px',
            background: 'linear-gradient(135deg, var(--primary), var(--accent))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28,
          }}>
            ✉️
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 10 }}>
            Contacto
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: 16, lineHeight: 1.7 }}>
            ¿Tienes alguna duda, sugerencia o problema? Escríbenos y te respondemos lo antes posible.
          </p>
        </div>

        <div style={{
          background: 'var(--card)', border: '1px solid var(--card-border)',
          borderRadius: 16, padding: 32, textAlign: 'center',
          boxShadow: 'var(--shadow-md)',
        }}>
          <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 16 }}>
            Puedes contactarnos directamente en:
          </p>
          <a
            href="mailto:paginaswebsgp@gmail.com"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              padding: '14px 28px', borderRadius: 10,
              background: 'var(--primary)', color: 'white',
              fontSize: 16, fontWeight: 700, textDecoration: 'none',
              boxShadow: '0 4px 12px rgba(91,108,248,0.3)',
              transition: 'all 0.2s',
            }}
          >
            ✉️ paginaswebsgp@gmail.com
          </a>

          <div style={{ marginTop: 28, padding: '16px', borderRadius: 10, background: 'var(--secondary)' }}>
            <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7 }}>
              🕐 Tiempo de respuesta habitual: <strong>24-48 horas</strong><br />
              📋 Para soporte premium indicar el email de tu cuenta
            </p>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Link href="/" style={{ color: 'var(--primary)', fontSize: 14, textDecoration: 'none' }}>
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
