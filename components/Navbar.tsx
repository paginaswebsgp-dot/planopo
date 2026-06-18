'use client';
import Link from 'next/link';
import { useTheme } from './ThemeProvider';
import { useUser } from './auth/UserProvider';
import { Sun, Moon, BookOpen, LayoutDashboard, CreditCard, Menu, X, LogOut, LogIn, Crown, User } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { user, esPremium, cargando, logout } = useUser();
  const [open, setOpen] = useState(false);
  const [menuUsuario, setMenuUsuario] = useState(false);

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'var(--background)',
      borderBottom: '1px solid var(--card-border)',
    }}>
      <nav style={{
        maxWidth: 1200, margin: '0 auto', padding: '0 16px',
        height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, var(--primary), var(--accent))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <BookOpen size={16} color="white" />
          </div>
          <span style={{ fontWeight: 700, fontSize: 18, color: 'var(--foreground)', letterSpacing: '-0.02em' }}>
            Plan<span style={{
              background: 'linear-gradient(135deg, var(--primary), var(--accent))',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>Opo</span>
          </span>
        </Link>

        {/* Desktop */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="desktop-nav">
          {user && (
            <Link href="/dashboard" style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px',
              borderRadius: 8, color: 'var(--muted)', textDecoration: 'none', fontSize: 14, fontWeight: 500,
            }}>
              <LayoutDashboard size={14} /> Dashboard
            </Link>
          )}
          <Link href="/precios" style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px',
            borderRadius: 8, color: 'var(--muted)', textDecoration: 'none', fontSize: 14, fontWeight: 500,
          }}>
            <CreditCard size={14} /> Precios
          </Link>

          {!cargando && (
            user ? (
              <div style={{ position: 'relative', marginLeft: 8 }}>
                <button
                  onClick={() => setMenuUsuario(!menuUsuario)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '6px 12px', borderRadius: 8, border: '1.5px solid var(--card-border)',
                    background: 'var(--secondary)', cursor: 'pointer', color: 'var(--foreground)',
                    fontSize: 13, fontWeight: 500,
                  }}
                >
                  <div style={{
                    width: 24, height: 24, borderRadius: '50%',
                    background: esPremium ? 'linear-gradient(135deg, #f59e0b, #f97316)' : 'var(--primary-light)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {esPremium ? <Crown size={12} color="white" /> : <User size={12} color="var(--primary)" />}
                  </div>
                  {esPremium && <span style={{ fontSize: 11, color: '#f59e0b', fontWeight: 700 }}>PREMIUM</span>}
                </button>
                {menuUsuario && (
                  <div style={{
                    position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                    background: 'var(--card)', border: '1px solid var(--card-border)',
                    borderRadius: 12, padding: 8, minWidth: 180,
                    boxShadow: 'var(--shadow-lg)', zIndex: 200,
                  }}>
                    <div style={{ padding: '8px 12px', fontSize: 12, color: 'var(--muted)', borderBottom: '1px solid var(--card-border)', marginBottom: 4 }}>
                      {user.email}
                    </div>
                    <Link href="/crear" onClick={() => setMenuUsuario(false)} style={{
                      display: 'block', padding: '8px 12px', borderRadius: 8,
                      fontSize: 13, color: 'var(--foreground)', textDecoration: 'none', fontWeight: 500,
                    }}>
                      ✏️ Crear plan
                    </Link>
                    {!esPremium && (
                      <Link href="/precios" onClick={() => setMenuUsuario(false)} style={{
                        display: 'block', padding: '8px 12px', borderRadius: 8,
                        fontSize: 13, color: '#f59e0b', textDecoration: 'none', fontWeight: 600,
                      }}>
                        👑 Ir a Premium
                      </Link>
                    )}
                    <button onClick={logout} style={{
                      display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                      padding: '8px 12px', borderRadius: 8, background: 'none', border: 'none',
                      fontSize: 13, color: 'var(--danger)', cursor: 'pointer', fontWeight: 500,
                    }}>
                      <LogOut size={13} /> Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/auth/login" style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px',
                  borderRadius: 8, color: 'var(--muted)', textDecoration: 'none', fontSize: 14, fontWeight: 500,
                }}>
                  <LogIn size={14} /> Entrar
                </Link>
                <Link href="/auth/registro" className="btn btn-primary btn-sm" style={{ marginLeft: 4 }}>
                  Registrarse
                </Link>
              </>
            )
          )}

          <button onClick={toggleTheme} className="btn btn-ghost btn-sm" style={{ marginLeft: 4, padding: 6 }}>
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>
        </div>

        {/* Mobile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} className="mobile-nav">
          <button onClick={toggleTheme} className="btn btn-ghost btn-sm" style={{ padding: 6 }}>
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>
          <button onClick={() => setOpen(!open)} className="btn btn-ghost btn-sm" style={{ padding: 6 }}>
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {open && (
        <div style={{
          background: 'var(--background)', borderTop: '1px solid var(--card-border)',
          padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 4,
        }} className="mobile-nav">
          {user && <Link href="/dashboard" onClick={() => setOpen(false)} style={{ padding: '10px 12px', borderRadius: 8, color: 'var(--foreground)', textDecoration: 'none', fontSize: 14 }}>📊 Dashboard</Link>}
          <Link href="/precios" onClick={() => setOpen(false)} style={{ padding: '10px 12px', borderRadius: 8, color: 'var(--foreground)', textDecoration: 'none', fontSize: 14 }}>💰 Precios</Link>
          {user ? (
            <>
              <Link href="/crear" onClick={() => setOpen(false)} className="btn btn-primary" style={{ marginTop: 4 }}>Crear plan</Link>
              <button onClick={logout} className="btn btn-secondary" style={{ marginTop: 4 }}>Cerrar sesión</button>
            </>
          ) : (
            <>
              <Link href="/auth/login" onClick={() => setOpen(false)} className="btn btn-secondary" style={{ marginTop: 4 }}>Entrar</Link>
              <Link href="/auth/registro" onClick={() => setOpen(false)} className="btn btn-primary" style={{ marginTop: 4 }}>Registrarse gratis</Link>
            </>
          )}
        </div>
      )}

      <style>{`
        @media (min-width: 640px) { .desktop-nav { display: flex !important; } .mobile-nav { display: none !important; } }
        @media (max-width: 639px) { .desktop-nav { display: none !important; } .mobile-nav { display: flex !important; } }
      `}</style>
    </header>
  );
}
