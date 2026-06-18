'use client';
import { useState, useEffect, useCallback } from 'react';
import { PlanEstudio } from '@/types';
import { calcularEstadisticas, replanificar } from '@/lib/algoritmo';
import { guardarPlan, obtenerPlan, obtenerPlanActivo, obtenerTodosLosPlanes } from '@/lib/storage';
import { exportarPDF } from '@/lib/pdf';
import { useUser } from '@/components/auth/UserProvider';
import CalendarioInteractivo from '@/components/calendar/CalendarioInteractivo';
import Link from 'next/link';
import {
  BookOpen, Target, Clock, TrendingUp, RefreshCw, Download,
  Plus, CheckCircle, AlertCircle, Flame, Calendar, ChevronDown,
  ChevronUp, Crown, Lock, Timer, Share2, BarChart2,
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';

export default function Dashboard() {
  const searchParams = useSearchParams();
  const { user, esPremium, puedeExportarPDF, exportacionesRestantes, refrescar } = useUser();
  const [plan, setPlan] = useState<PlanEstudio | null>(null);
  const [todosPlanes, setTodosPlanes] = useState<PlanEstudio[]>([]);
  const [cargando, setCargando] = useState(true);
  const [exportando, setExportando] = useState(false);
  const [replanificando, setReplanificando] = useState(false);
  const [mostrarCalendario, setMostrarCalendario] = useState(true);
  const [confirmReplan, setConfirmReplan] = useState(false);
  const [mostrarPomodoro, setMostrarPomodoro] = useState(false);
  const [pomodoroMin, setPomodoroMin] = useState(25);
  const [pomodoroSeg, setPomodoroSeg] = useState(0);
  const [pomodoroActivo, setPomodoroActivo] = useState(false);

  const cargarPlan = useCallback(() => {
    const id = searchParams.get('id');
    const p = id ? obtenerPlan(id) : obtenerPlanActivo();
    setPlan(p);
    setTodosPlanes(obtenerTodosLosPlanes());
    setCargando(false);
  }, [searchParams]);

  useEffect(() => { cargarPlan(); }, [cargarPlan]);

  // Pomodoro timer
  useEffect(() => {
    if (!pomodoroActivo) return;
    const interval = setInterval(() => {
      setPomodoroSeg(s => {
        if (s === 0) {
          setPomodoroMin(m => {
            if (m === 0) { setPomodoroActivo(false); return 25; }
            return m - 1;
          });
          return 59;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [pomodoroActivo]);

  async function handleExportarPDF() {
    if (!puedeExportarPDF) return;
    setExportando(true);
    try {
      await exportarPDF(plan!);
      // Registrar uso de exportación
      if (!esPremium) {
        await fetch('/api/user/pdf', { method: 'POST' });
        refrescar();
      }
    } catch (e) { console.error(e); }
    setExportando(false);
  }

  async function handleReplanificar() {
    setReplanificando(true);
    await new Promise(r => setTimeout(r, 800));
    const nuevo = replanificar(plan!);
    guardarPlan(nuevo);
    setPlan(nuevo);
    setReplanificando(false);
    setConfirmReplan(false);
  }

  async function handlePortal() {
    const res = await fetch('/api/portal', { method: 'POST' });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  }

  async function handleCompartir() {
    if (!esPremium) return;
    const url = `${window.location.origin}/planificacion/${plan!.id}`;
    await navigator.clipboard.writeText(url);
    alert('¡Enlace copiado al portapapeles!');
  }

  if (!user && !cargando) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 24px' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <BookOpen size={32} color="var(--primary)" />
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Inicia sesión para ver tu dashboard</h2>
        <p style={{ color: 'var(--muted)', marginBottom: 24 }}>Crea una cuenta gratis para guardar tu progreso.</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/auth/login" className="btn btn-secondary">Iniciar sesión</Link>
          <Link href="/auth/registro" className="btn btn-primary"><Plus size={16} /> Registrarse gratis</Link>
        </div>
      </div>
    );
  }

  if (cargando) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
      <div style={{ width: 36, height: 36, border: '3px solid var(--card-border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!plan) return (
    <div style={{ textAlign: 'center', padding: '80px 24px' }}>
      <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
        <BookOpen size={32} color="var(--primary)" />
      </div>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>No tienes ningún plan todavía</h2>
      <p style={{ color: 'var(--muted)', marginBottom: 24 }}>Crea tu primera planificación personalizada.</p>
      <Link href="/crear" className="btn btn-primary btn-lg"><Plus size={18} /> Crear mi planificación</Link>
    </div>
  );

  const stats = calcularEstadisticas(plan);
  const urgencia = stats.diasRestantes < 30 ? 'alta' : stats.diasRestantes < 90 ? 'media' : 'baja';
  const colorUrgencia = urgencia === 'alta' ? 'var(--danger)' : urgencia === 'media' ? 'var(--warning)' : 'var(--success)';

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px' }}>

      {/* Banner premium si no es premium */}
      {!esPremium && (
        <div style={{
          background: 'linear-gradient(135deg, #f59e0b20, #f9731620)',
          border: '1.5px solid #f59e0b',
          borderRadius: 12, padding: '12px 20px', marginBottom: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Crown size={18} color="#f59e0b" />
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--foreground)' }}>
              Plan gratuito · {exportacionesRestantes > 0 ? `${exportacionesRestantes} exportación${exportacionesRestantes !== 1 ? 'es' : ''} PDF restante${exportacionesRestantes !== 1 ? 's' : ''}` : 'Sin exportaciones PDF disponibles'}
            </span>
          </div>
          <Link href="/precios" style={{
            padding: '6px 14px', borderRadius: 8,
            background: '#f59e0b', color: 'white',
            fontSize: 13, fontWeight: 700, textDecoration: 'none',
          }}>
            👑 Ir a Premium — 4,99€/mes
          </Link>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <div style={{ padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 600, background: colorUrgencia + '20', color: colorUrgencia }}>
              {urgencia === 'alta' ? '🔥 Alta urgencia' : urgencia === 'media' ? '⚡ Ritmo activo' : '✅ Buen ritmo'}
            </div>
            {esPremium && <div style={{ padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700, background: '#f59e0b20', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: 4 }}><Crown size={10} /> PREMIUM</div>}
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.03em' }}>{plan.formulario.nombreOposicion}</h1>
          <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 4 }}>
            Examen: {new Date(plan.formulario.fechaExamen + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {/* Selector de plan (solo premium con múltiples planes) */}
          {esPremium && todosPlanes.length > 1 && (
            <select
              className="input-field"
              style={{ width: 'auto', fontSize: 13 }}
              value={plan.id}
              onChange={(e) => { const p = obtenerPlan(e.target.value); if (p) setPlan(p); }}
            >
              {todosPlanes.map(p => <option key={p.id} value={p.id}>{p.formulario.nombreOposicion}</option>)}
            </select>
          )}

          {/* Pomodoro (solo premium) */}
          {esPremium ? (
            <button onClick={() => setMostrarPomodoro(!mostrarPomodoro)} className="btn btn-secondary" style={{ gap: 6 }}>
              <Timer size={14} /> Pomodoro
            </button>
          ) : (
            <div className="tooltip" data-tip="Solo Premium">
              <button className="btn btn-secondary" style={{ gap: 6, opacity: 0.5 }} disabled>
                <Lock size={12} /> <Timer size={14} />
              </button>
            </div>
          )}

          {/* Compartir (solo premium) */}
          {esPremium ? (
            <button onClick={handleCompartir} className="btn btn-secondary" style={{ gap: 6 }}>
              <Share2 size={14} /> Compartir
            </button>
          ) : null}

          <button onClick={() => setConfirmReplan(true)} className="btn btn-secondary" style={{ gap: 6 }}>
            <RefreshCw size={14} /> Recalcular
          </button>

          {/* PDF con límite para gratuitos */}
          {puedeExportarPDF ? (
            <button onClick={handleExportarPDF} disabled={exportando} className="btn btn-primary" style={{ gap: 6 }}>
              <Download size={14} /> {exportando ? 'Exportando...' : `PDF${!esPremium ? ` (${exportacionesRestantes} left)` : ''}`}
            </button>
          ) : (
            <Link href="/precios" style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '10px 18px', borderRadius: 8,
              background: '#f59e0b', color: 'white',
              fontSize: 14, fontWeight: 600, textDecoration: 'none',
            }}>
              <Crown size={14} /> Desbloquear PDF
            </Link>
          )}

          <Link href="/crear" className="btn btn-secondary" style={{ gap: 6 }}>
            <Plus size={14} /> {esPremium ? 'Nuevo plan' : <><Lock size={12} style={{ opacity: 0.6 }} /> Nuevo plan</>}
          </Link>
        </div>
      </div>

      {/* Pomodoro timer */}
      {mostrarPomodoro && esPremium && (
        <div style={{
          background: 'var(--card)', border: '1px solid var(--card-border)',
          borderRadius: 12, padding: '20px 24px', marginBottom: 20,
          display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap',
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, fontWeight: 900, letterSpacing: '-0.04em', fontVariantNumeric: 'tabular-nums', color: pomodoroActivo ? 'var(--primary)' : 'var(--foreground)' }}>
              {String(pomodoroMin).padStart(2, '0')}:{String(pomodoroSeg).padStart(2, '0')}
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
              {pomodoroActivo ? '🔴 Estudiando...' : '⏸ Pausado'}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button onClick={() => setPomodoroActivo(!pomodoroActivo)} className={`btn ${pomodoroActivo ? 'btn-secondary' : 'btn-primary'}`}>
              {pomodoroActivo ? '⏸ Pausar' : '▶ Iniciar'}
            </button>
            <button onClick={() => { setPomodoroActivo(false); setPomodoroMin(25); setPomodoroSeg(0); }} className="btn btn-ghost">
              ↺ Reiniciar
            </button>
            {[25, 45, 60].map(m => (
              <button key={m} onClick={() => { setPomodoroActivo(false); setPomodoroMin(m); setPomodoroSeg(0); }} className="btn btn-ghost btn-sm">
                {m}min
              </button>
            ))}
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted)', maxWidth: 200 }}>
            💡 Estudia 25 min, descansa 5. Repite 4 veces y toma un descanso largo.
          </div>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 20 }}>
        {[
          { icon: Calendar, color: colorUrgencia, label: 'Días restantes', value: stats.diasRestantes, sub: 'hasta examen' },
          { icon: Target, color: 'var(--primary)', label: 'Completados', value: stats.temasCompletados, sub: `de ${stats.totalTemas} temas` },
          { icon: CheckCircle, color: 'var(--success)', label: 'Porcentaje', value: `${stats.porcentajeCompletado}%`, sub: 'del temario' },
          { icon: Flame, color: 'var(--warning)', label: 'Racha', value: stats.rachaActual, sub: 'días seguidos' },
          { icon: Clock, color: 'var(--accent)', label: 'Horas', value: `${stats.horasEstudiadas}h`, sub: 'estudiadas' },
          { icon: AlertCircle, color: 'var(--danger)', label: 'Repasos', value: stats.repasosPendientes, sub: 'pendientes hoy' },
        ].map(({ icon: Icon, color, label, value, sub }) => (
          <div key={label} style={{ background: 'var(--card)', border: '1px solid var(--card-border)', borderRadius: 12, padding: '14px 16px' }} className="card-hover">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <div style={{ width: 26, height: 26, borderRadius: 7, background: color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={13} color={color} />
              </div>
              <span style={{ fontSize: 11, color: 'var(--muted)' }}>{label}</span>
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.03em' }}>{value}</div>
            <div style={{ fontSize: 11, color: 'var(--muted-light)', marginTop: 2 }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Progreso */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--card-border)', borderRadius: 12, padding: '18px 22px', marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            <TrendingUp size={16} color="var(--primary)" /> Progreso general
          </h3>
          <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--primary)' }}>{stats.porcentajeCompletado}%</span>
        </div>
        <div className="progress-bar">
          <div className="progress-bar-fill" style={{ width: `${stats.porcentajeCompletado}%` }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>{stats.temasCompletados} completados</span>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>{stats.temasPendientes} pendientes</span>
        </div>
      </div>

      {/* Estadísticas avanzadas (solo premium) */}
      {esPremium ? (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 12, marginBottom: 20,
        }}>
          {[
            { label: 'Temas por semana', value: plan.resumen.temasPorSemana, icon: BarChart2 },
            { label: 'Horas semanales', value: `${plan.resumen.horasSemanales}h`, icon: Clock },
            { label: 'Semanas de estudio', value: plan.resumen.semanasEstudio, icon: Calendar },
            { label: 'Horas totales', value: `${plan.resumen.horasTotales}h`, icon: Target },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} style={{ background: 'var(--secondary)', border: '1px solid var(--card-border)', borderRadius: 10, padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{value}</div>
              </div>
              <Icon size={20} color="var(--primary)" style={{ opacity: 0.4 }} />
            </div>
          ))}
        </div>
      ) : (
        <div style={{
          background: 'var(--secondary)', border: '1.5px dashed var(--card-border)',
          borderRadius: 12, padding: '18px 22px', marginBottom: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Lock size={18} color="var(--muted)" />
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Estadísticas avanzadas</div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>Temas/semana, horas totales, proyección de aprobado</div>
            </div>
          </div>
          <Link href="/precios" style={{ padding: '6px 14px', borderRadius: 8, background: '#f59e0b', color: 'white', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
            👑 Desbloquear
          </Link>
        </div>
      )}

      {/* Calendario */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--card-border)', borderRadius: 12, overflow: 'hidden' }}>
        <button
          onClick={() => setMostrarCalendario(v => !v)}
          style={{ width: '100%', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', borderBottom: mostrarCalendario ? '1px solid var(--card-border)' : 'none' }}
        >
          <h3 style={{ fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--foreground)' }}>
            <Calendar size={16} color="var(--primary)" /> Calendario de estudio
          </h3>
          {mostrarCalendario ? <ChevronUp size={16} color="var(--muted)" /> : <ChevronDown size={16} color="var(--muted)" />}
        </button>
        {mostrarCalendario && (
          <div style={{ padding: 20 }}>
            <CalendarioInteractivo plan={plan} onUpdate={setPlan} />
          </div>
        )}
      </div>

      {/* Gestionar suscripción (solo premium) */}
      {esPremium && (
        <div style={{ marginTop: 20, textAlign: 'center' }}>
          <button onClick={handlePortal} className="btn btn-ghost btn-sm" style={{ color: 'var(--muted)', fontSize: 12 }}>
            Gestionar suscripción Premium →
          </button>
        </div>
      )}

      {/* Modal replanificar */}
      {confirmReplan && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: 16 }}>
          <div style={{ background: 'var(--background)', border: '1px solid var(--card-border)', borderRadius: 16, padding: 28, maxWidth: 400, width: '100%', boxShadow: 'var(--shadow-lg)' }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Recalcular planificación</h3>
            <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 20, lineHeight: 1.6 }}>
              Se mantendrán los temas completados y se redistribuirán los pendientes respetando la fecha del examen.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setConfirmReplan(false)} className="btn btn-secondary" style={{ flex: 1 }}>Cancelar</button>
              <button onClick={handleReplanificar} disabled={replanificando} className="btn btn-primary" style={{ flex: 1, gap: 6 }}>
                {replanificando ? <>
                  <div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  Calculando...
                </> : <><RefreshCw size={14} /> Recalcular</>}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
