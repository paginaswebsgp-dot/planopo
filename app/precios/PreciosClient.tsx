'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Check, X, Loader2 } from 'lucide-react';
import { Suspense } from 'react';

const PLAN_GRATIS = {
  nombre: 'Gratis',
  precio: '0€',
  periodo: 'para siempre',
  descripcion: 'Perfecto para empezar tu preparación',
  features: [
    { texto: '1 planificación activa', incluido: true },
    { texto: 'Calendario mensual interactivo', incluido: true },
    { texto: 'Repasos espaciados automáticos', incluido: true },
    { texto: 'Dashboard de progreso', incluido: true },
    { texto: 'Recalcular planificación', incluido: true },
    { texto: 'Exportación PDF', incluido: false },
    { texto: 'Planificaciones ilimitadas', incluido: false },
    { texto: 'Varias oposiciones simultáneas', incluido: false },
    { texto: 'Estadísticas avanzadas', incluido: false },
    { texto: 'Soporte prioritario', incluido: false },
  ],
};

const PLAN_PREMIUM = {
  nombre: 'Premium',
  precio: '4,99€',
  periodo: 'al mes',
  descripcion: 'Para opositores que van en serio',
  badge: '🔥 Más popular',
  features: [
    { texto: 'Planificaciones ilimitadas', incluido: true },
    { texto: 'Calendario mensual interactivo', incluido: true },
    { texto: 'Repasos espaciados automáticos', incluido: true },
    { texto: 'Dashboard de progreso', incluido: true },
    { texto: 'Recalcular planificación', incluido: true },
    { texto: 'Exportación PDF profesional', incluido: true },
    { texto: 'Varias oposiciones simultáneas', incluido: true },
    { texto: 'Estadísticas avanzadas', incluido: true },
    { texto: 'Soporte prioritario', incluido: true },
    { texto: 'Acceso anticipado a nuevas funciones', incluido: true },
  ],
};

const FAQ = [
  { q: '¿Puedo cambiar de plan en cualquier momento?', a: 'Sí, puedes cancelar tu suscripción cuando quieras. Si cancelas, mantendrás el acceso Premium hasta el final del período pagado.' },
  { q: '¿Necesito tarjeta de crédito para el plan gratuito?', a: 'No. El plan gratuito no requiere ningún método de pago. Puedes empezar ahora mismo sin dar ningún dato bancario.' },
  { q: '¿Qué pasa con mis planificaciones si cancelo Premium?', a: 'Conservarás tu primera planificación activa. Las demás quedarán archivadas y podrás recuperarlas si vuelves a Premium.' },
  { q: '¿El plan Premium tiene permanencia mínima?', a: 'No. Es mes a mes, sin permanencia. Cancela cuando quieras.' },
  { q: '¿Es seguro el pago?', a: 'Sí. Los pagos se procesan a través de Stripe, líder mundial en pagos online. Tus datos bancarios nunca pasan por nuestros servidores.' },
];

function CancelledBanner() {
  const params = useSearchParams();
  if (!params.get('cancelled')) return null;
  return (
    <div style={{
      background: 'var(--warning-light)', border: '1px solid var(--warning)',
      borderRadius: 10, padding: '12px 20px', maxWidth: 600, margin: '0 auto 24px',
      textAlign: 'center', fontSize: 14, color: 'var(--warning)', fontWeight: 500,
    }}>
      ⚠️ Has cancelado el proceso de pago. Puedes intentarlo de nuevo cuando quieras.
    </div>
  );
}

function PreciosContent() {
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  async function handlePremium() {
    setCargando(true);
    setError('');
    try {
      const res = await fetch('/api/checkout', { method: 'POST' });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || 'Error al procesar el pago');
        setCargando(false);
      }
    } catch {
      setError('Error de conexión. Inténtalo de nuevo.');
      setCargando(false);
    }
  }

  return (
    <div style={{ background: 'var(--secondary)', minHeight: 'calc(100vh - 56px)', paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ textAlign: 'center', padding: '64px 16px 48px' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '5px 14px', borderRadius: 99,
          background: 'var(--primary-light)', border: '1px solid var(--primary)',
          color: 'var(--primary)', fontSize: 13, fontWeight: 600, marginBottom: 20,
        }}>
          💰 Precios transparentes, sin sorpresas
        </div>
        <h1 style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: 14 }}>
          El plan perfecto para cada opositor
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: 17, maxWidth: 480, margin: '0 auto' }}>
          Empieza gratis hoy. Pasa a Premium cuando necesites más.
        </p>
      </div>

      <Suspense fallback={null}>
        <CancelledBanner />
      </Suspense>

      {error && (
        <div style={{
          background: 'var(--danger-light)', border: '1px solid var(--danger)',
          borderRadius: 10, padding: '12px 20px', maxWidth: 600, margin: '0 auto 24px',
          textAlign: 'center', fontSize: 14, color: 'var(--danger)',
        }}>
          ❌ {error}
        </div>
      )}

      {/* Planes */}
      <div style={{
        display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap',
        padding: '0 16px', maxWidth: 900, margin: '0 auto',
      }}>
        {/* Plan Gratis */}
        <div style={{
          flex: '1 1 320px', maxWidth: 420,
          background: 'var(--card)', borderRadius: 20,
          border: '1.5px solid var(--card-border)',
          padding: 32, boxShadow: 'var(--shadow-md)',
        }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>{PLAN_GRATIS.nombre}</h2>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16 }}>{PLAN_GRATIS.descripcion}</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 24 }}>
            <span style={{ fontSize: 44, fontWeight: 900, letterSpacing: '-0.04em' }}>{PLAN_GRATIS.precio}</span>
            <span style={{ fontSize: 14, color: 'var(--muted)' }}>/{PLAN_GRATIS.periodo}</span>
          </div>
          <Link href="/crear" style={{
            display: 'block', textAlign: 'center', padding: '13px 24px', borderRadius: 10,
            background: 'var(--primary)', color: 'white',
            fontWeight: 700, fontSize: 15, textDecoration: 'none', marginBottom: 28,
          }}>
            Empezar gratis
          </Link>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {PLAN_GRATIS.features.map(({ texto, incluido }) => (
              <div key={texto} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: incluido ? 'var(--success-light)' : 'var(--secondary)',
                }}>
                  {incluido
                    ? <Check size={11} color="var(--success)" strokeWidth={3} />
                    : <X size={11} color="var(--muted-light)" strokeWidth={3} />}
                </div>
                <span style={{
                  fontSize: 13,
                  color: incluido ? 'var(--foreground)' : 'var(--muted-light)',
                  textDecoration: incluido ? 'none' : 'line-through',
                }}>
                  {texto}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Plan Premium */}
        <div style={{
          flex: '1 1 320px', maxWidth: 420,
          background: 'linear-gradient(135deg, var(--primary), var(--accent))',
          borderRadius: 20, padding: 32, position: 'relative',
          boxShadow: '0 20px 60px rgba(91,108,248,0.3)',
        }}>
          <div style={{
            position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)',
            background: 'var(--warning)', color: 'white',
            padding: '4px 16px', borderRadius: 99, fontSize: 12, fontWeight: 700,
            whiteSpace: 'nowrap',
          }}>
            {PLAN_PREMIUM.badge}
          </div>

          <h2 style={{ fontSize: 20, fontWeight: 800, color: 'white', marginBottom: 4 }}>{PLAN_PREMIUM.nombre}</h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', marginBottom: 16 }}>{PLAN_PREMIUM.descripcion}</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 24 }}>
            <span style={{ fontSize: 44, fontWeight: 900, color: 'white', letterSpacing: '-0.04em' }}>{PLAN_PREMIUM.precio}</span>
            <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>/{PLAN_PREMIUM.periodo}</span>
          </div>

          <button
            onClick={handlePremium}
            disabled={cargando}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              width: '100%', padding: '13px 24px', borderRadius: 10,
              background: 'white', color: 'var(--primary)',
              fontWeight: 700, fontSize: 15, border: 'none', cursor: cargando ? 'not-allowed' : 'pointer',
              marginBottom: 28, opacity: cargando ? 0.8 : 1, transition: 'opacity 0.15s',
            }}
          >
            {cargando ? (
              <><Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} /> Redirigiendo a Stripe...</>
            ) : (
              <>💳 Suscribirse por 4,99€/mes</>
            )}
          </button>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {PLAN_PREMIUM.features.map(({ texto, incluido }) => (
              <div key={texto} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(255,255,255,0.2)',
                }}>
                  <Check size={11} color="white" strokeWidth={3} />
                </div>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)' }}>{texto}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stripe badge */}
      <div style={{ maxWidth: 580, margin: '32px auto 0', padding: '0 16px', textAlign: 'center' }}>
        <div style={{
          background: 'var(--card)', border: '1px solid var(--card-border)',
          borderRadius: 12, padding: '14px 20px', fontSize: 13, color: 'var(--muted)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          🔒 Pagos seguros procesados por <strong>Stripe</strong> · Cancela cuando quieras
        </div>
      </div>

      {/* FAQ */}
      <div style={{ maxWidth: 680, margin: '64px auto 0', padding: '0 16px' }}>
        <h2 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.03em', textAlign: 'center', marginBottom: 32 }}>
          Preguntas frecuentes
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {FAQ.map(({ q, a }) => (
            <details key={q} style={{
              background: 'var(--card)', border: '1px solid var(--card-border)',
              borderRadius: 12, padding: '16px 20px',
            }}>
              <summary style={{
                fontWeight: 600, fontSize: 15, cursor: 'pointer',
                listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                {q}
                <span style={{ color: 'var(--muted)', fontSize: 18, flexShrink: 0, marginLeft: 12 }}>＋</span>
              </summary>
              <p style={{ marginTop: 12, fontSize: 14, color: 'var(--muted)', lineHeight: 1.7 }}>{a}</p>
            </details>
          ))}
        </div>
      </div>

      <div style={{ textAlign: 'center', padding: '64px 16px 0' }}>
        <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 12 }}>¿Listo para empezar gratis?</h3>
        <Link href="/crear" className="btn btn-primary btn-lg">🚀 Crear planificación gratis</Link>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function PreciosClient() {
  return (
    <Suspense fallback={<div style={{ minHeight: '80vh' }} />}>
      <PreciosContent />
    </Suspense>
  );
}
