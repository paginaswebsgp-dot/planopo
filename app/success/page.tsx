'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [listo, setListo] = useState(false);

  useEffect(() => {
    // Marcar como premium en localStorage (en producción real vendría de tu BD)
    if (sessionId) {
      localStorage.setItem('planopo_premium', 'true');
      localStorage.setItem('planopo_stripe_session', sessionId);
    }
    const t = setTimeout(() => setListo(true), 1200);
    return () => clearTimeout(t);
  }, [sessionId]);

  return (
    <div style={{
      minHeight: 'calc(100vh - 56px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
      background: 'var(--secondary)',
    }}>
      <div style={{
        background: 'var(--card)', border: '1px solid var(--card-border)',
        borderRadius: 20, padding: '48px 40px', maxWidth: 480, width: '100%',
        textAlign: 'center', boxShadow: 'var(--shadow-lg)',
      }}>
        {!listo ? (
          <>
            <div style={{
              width: 56, height: 56, border: '4px solid var(--card-border)',
              borderTopColor: 'var(--primary)', borderRadius: '50%',
              animation: 'spin 0.8s linear infinite', margin: '0 auto 20px',
            }} />
            <p style={{ color: 'var(--muted)', fontSize: 15 }}>Confirmando tu pago...</p>
          </>
        ) : (
          <>
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: 'var(--success-light)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 24px', fontSize: 36,
            }}>
              ✅
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 900, marginBottom: 12, letterSpacing: '-0.03em' }}>
              ¡Bienvenido a Premium!
            </h1>
            <p style={{ color: 'var(--muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 28 }}>
              Tu suscripción está activa. Ya tienes acceso a planificaciones ilimitadas,
              exportación PDF y todas las funciones avanzadas.
            </p>

            <div style={{
              background: 'var(--success-light)', border: '1px solid var(--success)',
              borderRadius: 10, padding: '12px 16px', marginBottom: 28,
              fontSize: 13, color: 'var(--success)', fontWeight: 500,
            }}>
              🎉 Plan Premium activado correctamente
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Link href="/crear" style={{
                display: 'block', padding: '13px 24px', borderRadius: 10,
                background: 'var(--primary)', color: 'white',
                fontWeight: 700, fontSize: 15, textDecoration: 'none',
              }}>
                Crear nueva planificación
              </Link>
              <Link href="/dashboard" style={{
                display: 'block', padding: '13px 24px', borderRadius: 10,
                background: 'var(--secondary)', color: 'var(--foreground)',
                border: '1px solid var(--card-border)',
                fontWeight: 600, fontSize: 14, textDecoration: 'none',
              }}>
                Ir al Dashboard
              </Link>
            </div>
          </>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 40, height: 40, border: '3px solid var(--card-border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>}>
      <SuccessContent />
    </Suspense>
  );
}
