'use client';
import { useState, useEffect, useCallback } from 'react';
import { PlanEstudio } from '@/types';
import { calcularEstadisticas, replanificar } from '@/lib/algoritmo';
import { guardarPlan, obtenerPlan, obtenerPlanActivo, obtenerTodosLosPlanes, eliminarPlan } from '@/lib/storage';
import { exportarPDF } from '@/lib/pdf';
import { useUser } from '@/components/auth/UserProvider';
import CalendarioInteractivo from '@/components/calendar/CalendarioInteractivo';
import Link from 'next/link';
import {
  BookOpen, Target, Clock, TrendingUp, RefreshCw, Download,
  Plus, CheckCircle, AlertCircle, Flame, Calendar, ChevronDown,
  ChevronUp, Crown, Lock, Timer, BarChart2, Trash2, ExternalLink,
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { format, parseISO, subDays } from 'date-fns';
import { es } from 'date-fns/locale';

export default function Dashboard() {
  const searchParams = useSearchParams();
  const { user, esPremium, puedeExportarPDF, exportacionesRestantes, refrescar } = useUser();
  const [plan, setPlan] = useState<PlanEstudio | null>(null);
  const [todosPlanes, setTodosPlanes] = useState<PlanEstudio[]>([]);
  const [cargando, setCargando] = useState(true);
  const [exportando, setExportando] = useState(false);
  const [replanificando, setReplanificando] = useState(false);
  const [mostrarCalendario, setMostrarCalendario] = useState(true);
  const [mostrarGrafica, setMostrarGrafica] = useState(false);
  const [confirmReplan, setConfirmReplan] = useState(false);
  const [confirmBorrar, setConfirmBorrar] = useState(false);
  const [mostrarPomodoro, setMostrarPomodoro] = useState(false);
  const [pomodoroMin, setPomodoroMin] = useState(25);
  const [pomodoroSeg, setPomodoroSeg] = useState(0);
  const [pomodoroActivo, setPomodoroActivo] = useState(false);
  const [portalCargando, setPortalCargando] = useState(false);

  const cargarPlan = useCallback(() => {
    const id = searchParams.get('id');
    const p = id ? obtenerPlan(id) : obtenerPlanActivo();
    setPlan(p);
    setTodosPlanes(obtenerTodosLosPlanes());
    setCargando(false);
  }, [searchParams]);

  useEffect(() => { cargarPlan(); }, [cargarPlan]);

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
    setTodosPlanes(obtenerTodosLosPlanes());
    setReplanificando(false);
    setConfirmReplan(false);
  }

  async function handleBorrarPlan() {
    if (!plan) return;
    eliminarPlan(plan.id);
    const planes = obtenerTodosLosPlanes();
    setTodosPlanes(planes);
    setPlan(planes.length > 0 ? planes[planes.length - 1] : null);
    setConfirmBorrar(false);
  }

  async function handlePortal() {
    setPortalCargando(true);
    const res = await fetch('/api/portal', { method: 'POST' });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    setPortalCargando(false);
  }

  // Datos para gráfica de progreso semanal
  function datosGrafica() {
    if (!plan) return [];
    const hoy = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const fecha = format(subDays(hoy, 6 - i), 'yyyy-MM-dd');
      const dia = plan.calendario.find(d => d.fecha === fecha);
      const labelDia = format(subDays(hoy, 6 - i), 'EEE', { locale: es });
      return {
        label: labelDia.charAt(0).toUpperCase() + labelDia.slice(1),
        completado: dia?.completado ? 1 : 0,
        tieneTarea: dia?.tipo === 'estudio' ? 1 : 0,
      };
    });
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
  const grafica = datosGrafica();

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px' }}>

      {/* Banner premium */}
      {!esPremium && (
        <div style={{
          background: 'linear-gradient(135deg, #f59e0b20, #f9731620)',
          border: '1.5px solid #f59e0b',
          borderRadius: 12, padding: '12px 20px', marginBottom: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Crown size={18} color="#f59e0b" />
            <span style={{ fontSize: 14, fontWeight: 600 }}>
              Plan gratuito · {exportacionesRestantes > 0 ? `${exportacionesRestantes} PDF restante${exportacionesRestantes !== 1 ? 's' : ''}` : 'Sin exportaciones PDF'}
            </span>
          </div>
          <Link href="/precios" style={{ padding: '6px 14px', borderRadius: 8, background: '#f59e0b', color: 'white', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
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
          {/* Selector de plan premium */}
          {esPremium && todosPlanes.length > 1 && (
            <select className="input-field" style={{ width: 'auto', fontSize: 13 }}
              value={plan.id}
              onChange={(e) => { const p = obtenerPlan(e.target.value); if (p) setPlan(p); }}>
              {todosPlanes.map(p => <option key={p.id} value={p.id}>{p.formulario.nombreOposicion}</option>)}
            </select>
          )}

          {/* Pomodoro */}
          {esPremium ? (
            <button onClick={() => setMostrarPomodoro(!mostrarPomodoro)} className="btn btn-secondary" style={{ gap: 6 }}>
              <Timer size={14} /> Pomodoro
            </button>
          ) : (
            <button className="btn btn-secondary" style={{ gap: 6, opacity: 0.5 }} disabled>
              <Lock size={12} /> <Timer size={14} />
            </button>
          )}

          <button onClick={() => setConfirmReplan(true)} className="btn btn-secondary" style={{ gap: 6 }}>
            <RefreshCw size={14} /> Recalcular
          </button>

          {puedeExportarPDF ? (
            <button onClick={handleExportarPDF} disabled={exportando} className="btn btn-primary" style={{ gap: 6 }}>
              <Download size={14} /> {exportando ? 'Exportando...' : `PDF${!esPremium ? ` (${exportacionesRestantes})` : ''}`}
            </button>
          ) : (
            <Link href="/precios" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 18px', borderRadius: 8, background: '#f59e0b', color: 'white', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
              <Crown size={14} /> Desbloquear PDF
            </Link>
          )}

          {esPremium && (
            <button onClick={() => setConfirmBorrar(true)} className="btn btn-secondary" style={{ gap: 6, color: 'var(--danger)' }}>
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Pomodoro */}
      {mostrarPomodoro && esPremium && (
        <div style={{ background: 'var(--card)', border: '1px solid var(--card-border)', borderRadius: 12, padding: '20px 24px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 52, fontWeight: 900, letterSpacing: '-0.04em', fontVariantNumeric: 'tabular-nums', color: pomodoroActivo ? 'var(--primary)' : 'var(--foreground)' }}>
              {String(pomodoroMin).padStart(2, '0')}:{String(pomodoroSeg).padStart(2, '0')}
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{pomodoroActivo ? '🔴 Estudiando...' : '⏸ Pausado'}</div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button onClick={() => setPomodoroActivo(!pomodoroActivo)} className={`btn ${pomodoroActivo ? 'btn-secondary' : 'btn-primary'}`}>
              {pomodoroActivo ? '⏸ Pausar' : '▶ Iniciar'}
            </button>
            <button onClick={() => { setPomodoroActivo(false); setPomodoroMin(25); setPomodoroSeg(0); }} className="btn btn-ghost">↺ Reiniciar</button>
            {[25, 45, 60].map(m => (
              <button key={m} onClick={() => { setPomodoroActivo(false); setPomodoroMin(m); setPomodoroSeg(0); }} className="btn btn-ghost btn-sm">{m}min</button>
            ))}
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted)', maxWidth: 200 }}>
            💡 Estudia 25 min, descansa 5. Repite 4 veces y toma un descanso largo.
          </div>
        </div>
      )}

      {/* Cuenta atrás grande */}
      <div style={{
        background: `linear-gradient(135deg, ${colorUrgencia}15, ${colorUrgencia}05)`,
        border: `1.5px solid ${colorUrgencia}40`,
        borderRadius: 12, padding: '16px 24px', marginBottom: 20,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
      }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 500, marginBottom: 2 }}>CUENTA ATRÁS</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontSize: 48, fontWeight: 900, letterSpacing: '-0.04em', color: colorUrgencia }}>
              {stats.diasRestantes}
            </span>
            <span style={{ fontSize: 16, color: 'var(--muted)', fontWeight: 500 }}>días para el examen</span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>Fecha del examen</div>
          <div style={{ fontSize: 15, fontWeight: 700 }}>
            {new Date(plan.formulario.fechaExamen + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 20 }}>
        {[
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

      {/* Gráfica semanal */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--card-border)', borderRadius: 12, overflow: 'hidden', marginBottom: 20 }}>
        <button onClick={() => setMostrarGrafica(v => !v)} style={{ width: '100%', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', borderBottom: mostrarGrafica ? '1px solid var(--card-border)' : 'none' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--foreground)' }}>
            <BarChart2 size={16} color="var(--primary)" /> Actividad últimos 7 días
          </h3>
          {mostrarGrafica ? <ChevronUp size={16} color="var(--muted)" /> : <ChevronDown size={16} color="var(--muted)" />}
        </button>
        {mostrarGrafica && (
          <div style={{ padding: '20px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 80 }}>
              {grafica.map(({ label, completado, tieneTarea }, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <div style={{
                    width: '100%', borderRadius: 6,
                    height: tieneTarea ? 60 : 20,
                    background: completado ? 'var(--success)' : tieneTarea ? 'var(--card-border)' : 'var(--secondary)',
                    transition: 'all 0.3s',
                    position: 'relative',
                  }}>
                    {completado === 1 && (
                      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', color: 'white', fontSize: 12 }}>✓</div>
                    )}
                  </div>
                  <span style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 500 }}>{label}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: 'var(--success)' }} />
                <span style={{ fontSize: 11, color: 'var(--muted)' }}>Completado</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: 'var(--card-border)' }} />
                <span style={{ fontSize: 11, color: 'var(--muted)' }}>Pendiente</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: 'var(--secondary)' }} />
                <span style={{ fontSize: 11, color: 'var(--muted)' }}>Sin tarea</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Estadísticas avanzadas premium */}
      {esPremium ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 20 }}>
          {[
            { label: 'Temas por semana', value: plan.resumen.temasPorSemana },
            { label: 'Horas semanales', value: `${plan.resumen.horasSemanales}h` },
            { label: 'Semanas de estudio', value: plan.resumen.semanasEstudio },
            { label: 'Horas totales', value: `${plan.resumen.horasTotales}h` },
          ].map(({ label, value }) => (
            <div key={label} style={{ background: 'var(--secondary)', border: '1px solid var(--card-border)', borderRadius: 10, padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{value}</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ background: 'var(--secondary)', border: '1.5px dashed var(--card-border)', borderRadius: 12, padding: '18px 22px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Lock size={18} color="var(--muted)" />
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Estadísticas avanzadas</div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>Temas/semana, horas totales, proyecciones</div>
            </div>
          </div>
          <Link href="/precios" style={{ padding: '6px 14px', borderRadius: 8, background: '#f59e0b', color: 'white', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
            👑 Desbloquear
          </Link>
        </div>
      )}

      {/* Calendario */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--card-border)', borderRadius: 12, overflow: 'hidden', marginBottom: 20 }}>
        <button onClick={() => setMostrarCalendario(v => !v)} style={{ width: '100%', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', borderBottom: mostrarCalendario ? '1px solid var(--card-border)' : 'none' }}>
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

      {/* Gestión premium */}
      {esPremium && (
        <div style={{
          background: 'var(--card)', border: '1px solid var(--card-border)',
          borderRadius: 12, padding: '20px 24px', marginBottom: 20,
        }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Crown size={16} color="#f59e0b" /> Tu suscripción Premium
          </h3>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 4 }}>Estado</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)' }} />
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--success)' }}>Activa</span>
              </div>
            </div>
            <button
              onClick={handlePortal}
              disabled={portalCargando}
              className="btn btn-secondary"
              style={{ gap: 6 }}
            >
              <ExternalLink size={14} />
              {portalCargando ? 'Cargando...' : 'Gestionar suscripción'}
            </button>
          </div>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 12 }}>
            Desde el portal puedes ver tus facturas, cambiar la tarjeta o cancelar la suscripción.
          </p>
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
                {replanificando ? <><div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />Calculando...</> : <><RefreshCw size={14} /> Recalcular</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal borrar plan */}
      {confirmBorrar && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: 16 }}>
          <div style={{ background: 'var(--background)', border: '1px solid var(--card-border)', borderRadius: 16, padding: 28, maxWidth: 400, width: '100%', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--danger-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Trash2 size={22} color="var(--danger)" />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>¿Borrar esta planificación?</h3>
            <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 20, lineHeight: 1.6 }}>
              Se eliminará <strong>{plan.formulario.nombreOposicion}</strong> y todo su progreso. Esta acción no se puede deshacer.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setConfirmBorrar(false)} className="btn btn-secondary" style={{ flex: 1 }}>Cancelar</button>
              <button onClick={handleBorrarPlan} className="btn btn-danger" style={{ flex: 1, gap: 6 }}>
                <Trash2 size={14} /> Borrar
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
