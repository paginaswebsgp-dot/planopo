'use client';
import { useState, useEffect, useCallback } from 'react';
import { PlanEstudio } from '@/types';
import { calcularEstadisticas, replanificar } from '@/lib/algoritmo';
import { guardarPlan, obtenerPlan, obtenerPlanActivo } from '@/lib/storage';
import { exportarPDF } from '@/lib/pdf';
import CalendarioInteractivo from '@/components/calendar/CalendarioInteractivo';
import Link from 'next/link';
import {
  BookOpen, Target, Clock, TrendingUp, RefreshCw, Download,
  Plus, CheckCircle, AlertCircle, Flame, Calendar, ChevronDown, ChevronUp,
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';

export default function Dashboard() {
  const searchParams = useSearchParams();
  const [plan, setPlan] = useState<PlanEstudio | null>(null);
  const [cargando, setCargando] = useState(true);
  const [exportando, setExportando] = useState(false);
  const [replanificando, setReplanificando] = useState(false);
  const [mostrarCalendario, setMostrarCalendario] = useState(true);
  const [confirmReplan, setConfirmReplan] = useState(false);

  const cargarPlan = useCallback(() => {
    const id = searchParams.get('id');
    const p = id ? obtenerPlan(id) : obtenerPlanActivo();
    setPlan(p);
    setCargando(false);
  }, [searchParams]);

  useEffect(() => { cargarPlan(); }, [cargarPlan]);

  if (cargando) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
        <div style={{
          width: 36, height: 36, border: '3px solid var(--card-border)',
          borderTopColor: 'var(--primary)', borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!plan) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 24px' }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: 'var(--primary-light)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
        }}>
          <BookOpen size={32} color="var(--primary)" />
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>No tienes ningún plan</h2>
        <p style={{ color: 'var(--muted)', marginBottom: 24, fontSize: 15 }}>
          Crea tu primera planificación personalizada en menos de 1 minuto.
        </p>
        <Link href="/crear" className="btn btn-primary btn-lg">
          <Plus size={18} /> Crear mi planificación
        </Link>
      </div>
    );
  }

  const stats = calcularEstadisticas(plan);

  async function handleExportarPDF() {
    setExportando(true);
    try {
      await exportarPDF(plan!);
    } catch (e) {
      console.error(e);
    }
    setExportando(false);
  }

  async function handleReplanificar() {
    setReplanificando(true);
    await new Promise((r) => setTimeout(r, 800));
    const nuevo = replanificar(plan!);
    guardarPlan(nuevo);
    setPlan(nuevo);
    setReplanificando(false);
    setConfirmReplan(false);
  }

  const urgencia = stats.diasRestantes < 30 ? 'alta' : stats.diasRestantes < 90 ? 'media' : 'baja';
  const colorUrgencia = urgencia === 'alta' ? 'var(--danger)' : urgencia === 'media' ? 'var(--warning)' : 'var(--success)';

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px' }}>

      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        flexWrap: 'wrap', gap: 12, marginBottom: 28,
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <div style={{
              padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 600,
              background: colorUrgencia + '20', color: colorUrgencia,
            }}>
              {urgencia === 'alta' ? '🔥 Alta urgencia' : urgencia === 'media' ? '⚡ Ritmo activo' : '✅ Buen ritmo'}
            </div>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.2 }}>
            {plan.formulario.nombreOposicion}
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 4 }}>
            Examen: {new Date(plan.formulario.fechaExamen + 'T12:00:00').toLocaleDateString('es-ES', {
              day: 'numeric', month: 'long', year: 'numeric',
            })}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            onClick={() => setConfirmReplan(true)}
            className="btn btn-secondary"
            style={{ gap: 6 }}
          >
            <RefreshCw size={14} /> Recalcular
          </button>
          <button
            onClick={handleExportarPDF}
            disabled={exportando}
            className="btn btn-primary"
            style={{ gap: 6 }}
          >
            <Download size={14} />
            {exportando ? 'Exportando...' : 'Exportar PDF'}
          </button>
          <Link href="/crear" className="btn btn-secondary" style={{ gap: 6 }}>
            <Plus size={14} /> Nuevo plan
          </Link>
        </div>
      </div>

      {/* Stats grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: 12, marginBottom: 24,
      }}>
        {[
          {
            icon: Calendar, color: colorUrgencia,
            label: 'Días restantes', value: stats.diasRestantes,
            sub: 'hasta el examen',
          },
          {
            icon: Target, color: 'var(--primary)',
            label: 'Temas completados', value: stats.temasCompletados,
            sub: `de ${stats.totalTemas} totales`,
          },
          {
            icon: CheckCircle, color: 'var(--success)',
            label: 'Porcentaje', value: `${stats.porcentajeCompletado}%`,
            sub: 'del temario',
          },
          {
            icon: Flame, color: 'var(--warning)',
            label: 'Racha actual', value: stats.rachaActual,
            sub: 'días seguidos',
          },
          {
            icon: Clock, color: 'var(--accent)',
            label: 'Horas estudiadas', value: `${stats.horasEstudiadas}h`,
            sub: 'registradas',
          },
          {
            icon: AlertCircle, color: 'var(--danger)',
            label: 'Repasos pendientes', value: stats.repasosPendientes,
            sub: 'por hacer hoy',
          },
        ].map(({ icon: Icon, color, label, value, sub }, i) => (
          <div key={i} style={{
            background: 'var(--card)', border: '1px solid var(--card-border)',
            borderRadius: 12, padding: '16px 18px',
            display: 'flex', flexDirection: 'column', gap: 4,
          }} className="card-hover animate-fadeIn">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8,
                background: color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={14} color={color} />
              </div>
              <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 500 }}>{label}</span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--foreground)' }}>
              {value}
            </div>
            <div style={{ fontSize: 11, color: 'var(--muted-light)' }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Barra de progreso */}
      <div style={{
        background: 'var(--card)', border: '1px solid var(--card-border)',
        borderRadius: 12, padding: '20px 24px', marginBottom: 24,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            <TrendingUp size={16} color="var(--primary)" /> Progreso general
          </h3>
          <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--primary)' }}>
            {stats.porcentajeCompletado}%
          </span>
        </div>
        <div className="progress-bar">
          <div className="progress-bar-fill" style={{ width: `${stats.porcentajeCompletado}%` }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>
            {stats.temasCompletados} temas completados
          </span>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>
            {stats.temasPendientes} pendientes
          </span>
        </div>
      </div>

      {/* Resumen del plan */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 12, marginBottom: 24,
      }}>
        {[
          { label: 'Temas por semana', value: plan.resumen.temasPorSemana },
          { label: 'Horas semanales', value: `${plan.resumen.horasSemanales}h` },
          { label: 'Semanas de estudio', value: plan.resumen.semanasEstudio },
          { label: 'Horas totales', value: `${plan.resumen.horasTotales}h` },
        ].map(({ label, value }) => (
          <div key={label} style={{
            background: 'var(--secondary)', border: '1px solid var(--card-border)',
            borderRadius: 10, padding: '14px 16px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span style={{ fontSize: 13, color: 'var(--muted)' }}>{label}</span>
            <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--foreground)' }}>{value}</span>
          </div>
        ))}
      </div>

      {/* Calendario */}
      <div style={{
        background: 'var(--card)', border: '1px solid var(--card-border)',
        borderRadius: 12, overflow: 'hidden',
      }}>
        <button
          onClick={() => setMostrarCalendario((v) => !v)}
          style={{
            width: '100%', padding: '16px 20px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            background: 'none', border: 'none', cursor: 'pointer',
            borderBottom: mostrarCalendario ? '1px solid var(--card-border)' : 'none',
          }}
        >
          <h3 style={{ fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--foreground)' }}>
            <Calendar size={16} color="var(--primary)" /> Calendario de estudio
          </h3>
          {mostrarCalendario ? <ChevronUp size={16} color="var(--muted)" /> : <ChevronDown size={16} color="var(--muted)" />}
        </button>

        {mostrarCalendario && (
          <div style={{ padding: '20px' }}>
            <CalendarioInteractivo plan={plan} onUpdate={setPlan} />
          </div>
        )}
      </div>

      {/* Modal confirmación replanificación */}
      {confirmReplan && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 300, padding: 16,
        }}>
          <div style={{
            background: 'var(--background)', border: '1px solid var(--card-border)',
            borderRadius: 16, padding: 28, maxWidth: 400, width: '100%',
            boxShadow: 'var(--shadow-lg)',
          }}>
            <div style={{
              width: 52, height: 52, borderRadius: 12,
              background: 'var(--warning-light)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', marginBottom: 16,
            }}>
              <RefreshCw size={24} color="var(--warning)" />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Recalcular planificación</h3>
            <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 20, lineHeight: 1.6 }}>
              El sistema mantendrá todos los temas completados y redistribuirá los pendientes
              respetando la fecha del examen.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setConfirmReplan(false)}
                className="btn btn-secondary"
                style={{ flex: 1 }}
              >
                Cancelar
              </button>
              <button
                onClick={handleReplanificar}
                disabled={replanificando}
                className="btn btn-primary"
                style={{ flex: 1, gap: 6 }}
              >
                {replanificando ? (
                  <>
                    <div style={{
                      width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)',
                      borderTopColor: 'white', borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite',
                    }} />
                    Calculando...
                  </>
                ) : (
                  <><RefreshCw size={14} /> Recalcular</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
