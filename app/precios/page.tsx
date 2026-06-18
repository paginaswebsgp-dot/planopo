import type { Metadata } from 'next';
import Link from 'next/link';
import { Check, X } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Precios — PlanOpo',
  description: 'Empieza gratis con tu primera planificación. Desbloquea planificaciones ilimitadas, exportación PDF y más con el plan Premium por 4,99€/mes.',
};

const PLAN_GRATIS = {
  nombre: 'Gratis',
  precio: '0€',
  periodo: 'para siempre',
  descripcion: 'Perfecto para empezar tu preparación',
  color: 'var(--foreground)',
  bg: 'var(--card)',
  cta: 'Empezar gratis',
  href: '/crear',
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
  color: 'white',
  bg: 'linear-gradient(135deg, var(--primary), var(--accent))',
  cta: 'Próximamente',
  href: '#',
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
  {
    q: '¿Puedo cambiar de plan en cualquier momento?',
    a: 'Sí, puedes actualizar o cancelar tu suscripción cuando quieras. Si cancelas, mantendrás el acceso Premium hasta el final del período pagado.',
  },
  {
    q: '¿Necesito tarjeta de crédito para el plan gratuito?',
    a: 'No. El plan gratuito no requiere ningún método de pago. Puedes empezar a usar PlanOpo ahora mismo sin dar ningún dato bancario.',
  },
  {
    q: '¿Qué pasa con mis planificaciones si cancelo Premium?',
    a: 'Conservarás tu primera planificación activa. Las demás quedarán archivadas y podrás recuperarlas si vuelves a Premium.',
  },
  {
    q: '¿El plan Premium tiene permanencia mínima?',
    a: 'No. Es mes a mes, sin permanencia. Cancela cuando quieras desde tu perfil.',
  },
  {
    q: '¿Cuándo estará disponible el plan Premium?',
    a: 'Estamos trabajando en ello. Apúntate a la lista de espera para ser el primero en acceder cuando lancemos.',
  },
];

export default function PreciosPage() {
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
        <h1 style={{
          fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 900,
          letterSpacing: '-0.04em', marginBottom: 14,
        }}>
          El plan perfecto para cada opositor
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: 17, maxWidth: 480, margin: '0 auto' }}>
          Empieza gratis hoy. Pasa a Premium cuando necesites más.
        </p>
      </div>

      {/* Planes */}
      <div style={{
        display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap',
        padding: '0 16px', maxWidth: 900, margin: '0 auto',
      }}>
        {[PLAN_GRATIS, PLAN_PREMIUM].map((plan) => (
          <div
            key={plan.nombre}
            style={{
              flex: '1 1 320px', maxWidth: 420,
              background: plan.bg, borderRadius: 20,
              border: plan.nombre === 'Gratis' ? '1.5px solid var(--card-border)' : 'none',
              padding: 32, position: 'relative',
              boxShadow: plan.nombre === 'Premium' ? '0 20px 60px rgba(91,108,248,0.3)' : 'var(--shadow-md)',
            }}
          >
            {('badge' in plan) && typeof plan.badge === 'string' && (
              <div style={{
                position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)',
                background: 'var(--warning)', color: 'white',
                padding: '4px 16px', borderRadius: 99, fontSize: 12, fontWeight: 700,
                whiteSpace: 'nowrap',
              }}>
                {plan.badge}
              </div>
            )}

            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: plan.color, marginBottom: 4 }}>
                {plan.nombre}
              </h2>
              <p style={{ fontSize: 13, color: plan.nombre === 'Premium' ? 'rgba(255,255,255,0.75)' : 'var(--muted)', marginBottom: 16 }}>
                {plan.descripcion}
              </p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ fontSize: 44, fontWeight: 900, color: plan.color, letterSpacing: '-0.04em' }}>
                  {plan.precio}
                </span>
                <span style={{ fontSize: 14, color: plan.nombre === 'Premium' ? 'rgba(255,255,255,0.7)' : 'var(--muted)' }}>
                  /{plan.periodo}
                </span>
              </div>
            </div>

            <Link
              href={plan.href}
              style={{
                display: 'block', textAlign: 'center',
                padding: '13px 24px', borderRadius: 10,
                background: plan.nombre === 'Premium' ? 'white' : 'var(--primary)',
                color: plan.nombre === 'Premium' ? 'var(--primary)' : 'white',
                fontWeight: 700, fontSize: 15, textDecoration: 'none',
                marginBottom: 28, transition: 'opacity 0.15s',
                opacity: plan.href === '#' ? 0.7 : 1,
                cursor: plan.href === '#' ? 'not-allowed' : 'pointer',
              }}
            >
              {plan.cta}
            </Link>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {plan.features.map(({ texto, incluido }) => (
                <div key={texto} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: incluido
                      ? (plan.nombre === 'Premium' ? 'rgba(255,255,255,0.2)' : 'var(--success-light)')
                      : 'var(--secondary)',
                  }}>
                    {incluido
                      ? <Check size={11} color={plan.nombre === 'Premium' ? 'white' : 'var(--success)'} strokeWidth={3} />
                      : <X size={11} color="var(--muted-light)" strokeWidth={3} />
                    }
                  </div>
                  <span style={{
                    fontSize: 13,
                    color: incluido
                      ? (plan.nombre === 'Premium' ? 'rgba(255,255,255,0.9)' : 'var(--foreground)')
                      : 'var(--muted-light)',
                    textDecoration: incluido ? 'none' : 'line-through',
                  }}>
                    {texto}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Aviso integración Stripe */}
      <div style={{
        maxWidth: 580, margin: '40px auto 0', padding: '0 16px', textAlign: 'center',
      }}>
        <div style={{
          background: 'var(--card)', border: '1px solid var(--card-border)',
          borderRadius: 12, padding: '16px 20px', fontSize: 13, color: 'var(--muted)',
        }}>
          🔒 Los pagos serán procesados de forma segura a través de <strong>Stripe</strong>.
          Tus datos bancarios nunca pasan por nuestros servidores.
        </div>
      </div>

      {/* FAQ */}
      <div style={{ maxWidth: 680, margin: '64px auto 0', padding: '0 16px' }}>
        <h2 style={{
          fontSize: 26, fontWeight: 800, letterSpacing: '-0.03em',
          textAlign: 'center', marginBottom: 32,
        }}>
          Preguntas frecuentes
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {FAQ.map(({ q, a }) => (
            <details
              key={q}
              style={{
                background: 'var(--card)', border: '1px solid var(--card-border)',
                borderRadius: 12, padding: '16px 20px',
              }}
            >
              <summary style={{
                fontWeight: 600, fontSize: 15, cursor: 'pointer',
                listStyle: 'none', display: 'flex', justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                {q}
                <span style={{ color: 'var(--muted)', fontSize: 18, flexShrink: 0, marginLeft: 12 }}>＋</span>
              </summary>
              <p style={{ marginTop: 12, fontSize: 14, color: 'var(--muted)', lineHeight: 1.7 }}>{a}</p>
            </details>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ textAlign: 'center', padding: '64px 16px 0' }}>
        <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 12 }}>¿Listo para empezar?</h3>
        <p style={{ color: 'var(--muted)', marginBottom: 24 }}>
          Crea tu primera planificación gratis ahora mismo
        </p>
        <Link href="/crear" className="btn btn-primary btn-lg">
          🚀 Crear planificación gratis
        </Link>
      </div>
    </div>
  );
}
