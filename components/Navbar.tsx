'use client';
import Link from 'next/link';
import { useTheme } from './ThemeProvider';
import { Sun, Moon, BookOpen, LayoutDashboard, CreditCard, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);

  const links = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/precios', label: 'Precios', icon: CreditCard },
  ];

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'var(--background)',
      borderBottom: '1px solid var(--card-border)',
      backdropFilter: 'blur(12px)',
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
            Plan<span className="gradient-text">Opo</span>
          </span>
        </Link>

        {/* Desktop links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="desktop-nav">
          {links.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 12px', borderRadius: 8,
              color: 'var(--muted)', textDecoration: 'none', fontSize: 14, fontWeight: 500,
              transition: 'color 0.15s, background 0.15s',
            }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color = 'var(--foreground)';
                (e.currentTarget as HTMLElement).style.background = 'var(--secondary)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color = 'var(--muted)';
                (e.currentTarget as HTMLElement).style.background = 'transparent';
              }}
            >
              <Icon size={14} />
              {label}
            </Link>
          ))}

          <Link href="/crear" className="btn btn-primary btn-sm" style={{ marginLeft: 8 }}>
            Crear plan
          </Link>

          <button
            onClick={toggleTheme}
            className="btn btn-ghost btn-sm"
            style={{ marginLeft: 4, padding: '6px', borderRadius: 8 }}
            aria-label="Cambiar tema"
          >
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

      {/* Mobile menu */}
      {open && (
        <div style={{
          background: 'var(--background)',
          borderTop: '1px solid var(--card-border)',
          padding: '12px 16px',
          display: 'flex', flexDirection: 'column', gap: 4,
        }} className="mobile-nav">
          {links.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} onClick={() => setOpen(false)} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 12px', borderRadius: 8,
              color: 'var(--foreground)', textDecoration: 'none', fontSize: 14, fontWeight: 500,
            }}>
              <Icon size={16} />
              {label}
            </Link>
          ))}
          <Link href="/crear" onClick={() => setOpen(false)} className="btn btn-primary" style={{ marginTop: 4 }}>
            Crear plan
          </Link>
        </div>
      )}

      <style>{`
        @media (min-width: 640px) {
          .desktop-nav { display: flex !important; }
          .mobile-nav { display: none !important; }
        }
        @media (max-width: 639px) {
          .desktop-nav { display: none !important; }
          .mobile-nav { display: flex !important; }
        }
      `}</style>
    </header>
  );
}
