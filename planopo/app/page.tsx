import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'PlanOpo — Genera tu planificación de oposiciones en 1 minuto',
  description:
    'Planificador gratuito de oposiciones. Introduce tu examen y tus temas, obtén un calendario personalizado con repasos espaciados automáticos. Sin IA, todo con algoritmos probados.',
};

const TESTIMONIOS = [
  { nombre: 'María G.', cargo: 'Aux. Administrativa Estado', texto: 'Aprobé a la primera con PlanOpo. Los repasos automáticos marcan la diferencia.', emoji: '⭐' },
  { nombre: 'Carlos R.', cargo: 'Opositor Policía Nacional', texto: 'Me organizó los 64 temas en semanas. Llevo 3 meses sin saltarme ningún día.', emoji: '🏆' },
  { nombre: 'Ana M.', cargo: 'Opositora Educación', texto: 'Increíble que sea gratis. El calendario se adapta a mis horas disponibles.', emoji: '💪' },
];

const FEATURES = [
  { icon: '🎯', title: 'Algoritmo inteligente', desc: 'Distribuye temas equilibradamente según tus horas disponibles y nivel actual.' },
  { icon: '🔄', title: 'Repasos espaciados', desc: 'Programa automáticamente 3 repasos por tema: al día siguiente, 7 días y 30 días.' },
  { icon: '📅', title: 'Calendario visual', desc: 'Vista mensual con cada tema asignado, tiempo recomendado y repasos programados.' },
  { icon: '📊', title: 'Seguimiento de progreso', desc: 'Dashboard con estadísticas en tiempo real: temas completados, racha y % avanzado.' },
  { icon: '🔁', title: 'Replanificación automática', desc: 'Si te retrasas, el sistema redistribuye los temas pendientes manteniendo el examen.' },
  { icon: '📄', title: 'Exportación PDF', desc: 'Descarga tu planificación completa para tenerla siempre a mano.' },
];

const OPOSICIONES = [
  'Auxiliar Administrativo', 'Policía Nacional', 'Guardia Civil', 'Correos',
  'Educación', 'Sanidad', 'Justicia', 'Hacienda', 'SEPE', 'Mossos',
];

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section style={{
        background: 'linear-gradient(135deg, var(--primary-light) 0%, var(--background) 60%)',
        padding: '80px 16px 96px',
        textAlign: 'center',
        borderBottom: '1px solid var(--card-border)',
      }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '5px 14px', borderRadius: 99,
            background: 'var(--primary-light)', border: '1px solid var(--primary)',
            color: 'var(--primary)', fontSize: 13, fontWeight: 600, marginBottom: 24,
          }}>
            ✨ 100% gratuito · Sin registro · Sin IA
          </div>

          <h1 style={{
            fontSize: 'clamp(32px, 6vw, 58px)',
            fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.1,
            marginBottom: 20,
          }}>
            Genera tu planificación de{' '}
            <span style={{
              background: 'linear-gradient(135deg, var(--primary), var(--accent))',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              oposiciones
            </span>{' '}
            en menos de 1 minuto
          </h1>

          <p style={{
            fontSize: 'clamp(16px, 2.5vw, 20px)',
            color: 'var(--muted)', lineHeight: 1.7, marginBottom: 36, maxWidth: 560, margin: '0 auto 36px',
          }}>
            Introduce tu examen, tus temas y tus horas disponibles.
            Obtén un calendario personalizado automáticamente.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/crear" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '16px 32px', borderRadius: 12,
              background: 'var(--primary)', color: 'white',
              fontSize: 17, fontWeight: 700, textDecoration: 'none',
              boxShadow: '0 8px 24px rgba(91,108,248,0.35)',
              transition: 'all 0.2s',
            }}>
              🚀 Crear planificación
            </Link>
            <Link href="/precios" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '16px 24px', borderRadius: 12,
              background: 'var(--secondary)', color: 'var(--foreground)',
              fontSize: 16, fontWeight: 600, textDecoration: 'none',
              border: '1.5px solid var(--card-border)',
            }}>
              Ver planes →
            </Link>
          </div>

          {/* Stats */}
          <div style={{
            display: 'flex', justifyContent: 'center', gap: 32,
            marginTop: 52, flexWrap: 'wrap',
          }}>
            {[
              { n: '+5.000', label: 'Opositores planificados' },
              { n: '100%', label: 'Gratuito para empezar' },
              { n: '<1 min', label: 'Para generar tu plan' },
            ].map(({ n, label }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--primary)' }}>{n}</div>
                <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Oposiciones populares */}
      <section style={{
        padding: '32px 16px',
        background: 'var(--secondary)',
        borderBottom: '1px solid var(--card-border)',
        overflow: 'hidden',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 500, marginBottom: 16 }}>
            Usado por opositores de
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
            {OPOSICIONES.map((o) => (
              <span key={o} style={{
                padding: '6px 14px', borderRadius: 99,
                background: 'var(--background)', border: '1px solid var(--card-border)',
                fontSize: 13, color: 'var(--foreground)', fontWeight: 500,
              }}>
                {o}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section style={{ padding: '80px 16px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <h2 style={{ fontSize: 'clamp(24px, 4vw, 38px)', fontWeight: 800, letterSpacing: '-0.03em' }}>
            ¿Cómo funciona?
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: 16, marginTop: 8 }}>
            Tres pasos para tener tu plan listo
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 24 }}>
          {[
            {
              step: '01', color: 'var(--primary)', bg: 'var(--primary-light)',
              title: 'Introduce tus datos',
              desc: 'Nombre de la oposición, fecha del examen, número de temas y horas disponibles cada día.',
            },
            {
              step: '02', color: 'var(--accent)', bg: 'var(--accent-light)',
              title: 'El algoritmo trabaja',
              desc: 'Nuestro motor calcula la distribución óptima de temas, repasos y simulacros finales.',
            },
            {
              step: '03', color: 'var(--success)', bg: 'var(--success-light)',
              title: 'Sigue tu calendario',
              desc: 'Accede al dashboard, marca temas completados, y recalcula si te retrasas.',
            },
          ].map(({ step, color, bg, title, desc }) => (
            <div key={step} style={{
              background: 'var(--card)', border: '1px solid var(--card-border)',
              borderRadius: 16, padding: 28,
            }} className="card-hover">
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 15, fontWeight: 800, color, marginBottom: 16,
              }}>
                {step}
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>{title}</h3>
              <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.6 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{
        padding: '80px 16px',
        background: 'var(--secondary)',
        borderTop: '1px solid var(--card-border)',
        borderBottom: '1px solid var(--card-border)',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <h2 style={{ fontSize: 'clamp(24px, 4vw, 38px)', fontWeight: 800, letterSpacing: '-0.03em' }}>
              Todo lo que necesitas para aprobar
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {FEATURES.map(({ icon, title, desc }) => (
              <div key={title} style={{
                background: 'var(--background)', border: '1px solid var(--card-border)',
                borderRadius: 12, padding: '20px 22px',
                display: 'flex', gap: 14, alignItems: 'flex-start',
              }} className="card-hover">
                <span style={{ fontSize: 24, flexShrink: 0 }}>{icon}</span>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>{title}</h3>
                  <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonios */}
      <section style={{ padding: '80px 16px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: 'clamp(24px, 4vw, 38px)', fontWeight: 800, letterSpacing: '-0.03em' }}>
            Opositores que ya planifican con nosotros
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
          {TESTIMONIOS.map(({ nombre, cargo, texto, emoji }) => (
            <div key={nombre} style={{
              background: 'var(--card)', border: '1px solid var(--card-border)',
              borderRadius: 14, padding: 24,
            }} className="card-hover">
              <div style={{ fontSize: 22, marginBottom: 12 }}>{emoji}</div>
              <p style={{ fontSize: 14, color: 'var(--foreground)', lineHeight: 1.7, marginBottom: 16 }}>
                "{texto}"
              </p>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{nombre}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{cargo}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Final */}
      <section style={{
        padding: '80px 16px',
        background: 'linear-gradient(135deg, var(--primary), var(--accent))',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(26px, 5vw, 44px)', fontWeight: 900, color: 'white', marginBottom: 16, letterSpacing: '-0.03em' }}>
            Empieza a planificar hoy
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 16, marginBottom: 32 }}>
            Únete a miles de opositores que ya tienen su estudio organizado.
          </p>
          <Link href="/crear" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '16px 36px', borderRadius: 12,
            background: 'white', color: 'var(--primary)',
            fontSize: 17, fontWeight: 700, textDecoration: 'none',
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          }}>
            🚀 Crear mi planificación gratis
          </Link>
        </div>
      </section>
    </div>
  );
}
