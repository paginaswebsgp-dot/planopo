'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { Eye, EyeOff, Loader2, BookOpen, Check } from 'lucide-react';

export default function RegistroPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [enviado, setEnviado] = useState(false);

  async function handleRegistro(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return; }
    setCargando(true);
    setError('');
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setError(error.message === 'User already registered' ? 'Este email ya tiene cuenta. Inicia sesión.' : error.message);
      setCargando(false);
    } else {
      setEnviado(true);
    }
  }

  if (enviado) {
    return (
      <div style={{
        minHeight: 'calc(100vh - 56px)', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        background: 'var(--secondary)', padding: 16,
      }}>
        <div style={{
          background: 'var(--card)', border: '1px solid var(--card-border)',
          borderRadius: 20, padding: '40px 36px', maxWidth: 420, width: '100%',
          textAlign: 'center', boxShadow: 'var(--shadow-lg)',
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'var(--success-light)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
          }}>
            <Check size={28} color="var(--success)" />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 10 }}>¡Revisa tu email!</h2>
          <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.7 }}>
            Te hemos enviado un enlace de confirmación a <strong>{email}</strong>.
            Haz clic en él para activar tu cuenta.
          </p>
          <Link href="/auth/login" className="btn btn-primary" style={{ marginTop: 24, width: '100%', justifyContent: 'center' }}>
            Ir al login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: 'calc(100vh - 56px)', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--secondary)', padding: 16,
    }}>
      <div style={{
        background: 'var(--card)', border: '1px solid var(--card-border)',
        borderRadius: 20, padding: '40px 36px', maxWidth: 420, width: '100%',
        boxShadow: 'var(--shadow-lg)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12, margin: '0 auto 12px',
            background: 'linear-gradient(135deg, var(--primary), var(--accent))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <BookOpen size={22} color="white" />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em' }}>Crea tu cuenta gratis</h1>
          <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 4 }}>Empieza a planificar tus oposiciones</p>
        </div>

        <form onSubmit={handleRegistro} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Email</label>
            <input
              type="email" required className="input-field"
              placeholder="tu@email.com"
              value={email} onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Contraseña</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'} required
                className="input-field" placeholder="Mínimo 6 caracteres"
                value={password} onChange={(e) => setPassword(e.target.value)}
                style={{ paddingRight: 44 }}
              />
              <button type="button" onClick={() => setShowPass(!showPass)} style={{
                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)',
              }}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div style={{ padding: '10px 12px', borderRadius: 8, background: 'var(--danger-light)', color: 'var(--danger)', fontSize: 13 }}>
              ❌ {error}
            </div>
          )}

          <button type="submit" disabled={cargando} className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: 4, padding: '12px' }}>
            {cargando ? <><Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} /> Creando cuenta...</> : 'Crear cuenta gratis'}
          </button>
        </form>

        <p style={{ fontSize: 12, color: 'var(--muted-light)', textAlign: 'center', marginTop: 14, lineHeight: 1.6 }}>
          Al registrarte aceptas nuestros términos de uso
        </p>

        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: 'var(--muted)' }}>
          ¿Ya tienes cuenta?{' '}
          <Link href="/auth/login" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
            Inicia sesión
          </Link>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
