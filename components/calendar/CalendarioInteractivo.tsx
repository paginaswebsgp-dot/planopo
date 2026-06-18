'use client';
import { useState, useMemo } from 'react';
import { PlanEstudio, DiaCalendario } from '@/types';
import { guardarPlan } from '@/lib/storage';
import { ChevronLeft, ChevronRight, Check, ArrowRight, BookOpen, RefreshCw, Star } from 'lucide-react';
import { etiquetaTipo, colorTipo } from '@/lib/utils';

interface CalendarProps {
  plan: PlanEstudio;
  onUpdate: (plan: PlanEstudio) => void;
}

const NOMBRES_MES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const DIAS_CABECERA = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

export default function CalendarioInteractivo({ plan, onUpdate }: CalendarProps) {
  const hoy = new Date();
  const [mes, setMes] = useState({ anio: hoy.getFullYear(), mes: hoy.getMonth() });
  const [diaSeleccionado, setDiaSeleccionado] = useState<DiaCalendario | null>(null);

  const isoHoy = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;

  const diasCalendario = useMemo(() => {
    const mapa = new Map<string, DiaCalendario>();
    plan.calendario.forEach((d) => mapa.set(d.fecha, d));

    const dias: (DiaCalendario | null)[] = [];
    const primero = new Date(mes.anio, mes.mes, 1);
    const ultimo = new Date(mes.anio, mes.mes + 1, 0);
    const offset = primero.getDay() === 0 ? 6 : primero.getDay() - 1;

    for (let i = 0; i < offset; i++) dias.push(null);

    for (let d = 1; d <= ultimo.getDate(); d++) {
      const iso = `${mes.anio}-${String(mes.mes + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      dias.push(mapa.get(iso) || {
        fecha: iso, tipo: 'libre', horasEstudio: 0, repasos: [],
        completado: false, pospuesto: false, esLibre: true, esFestivo: false,
      });
    }

    return dias;
  }, [plan.calendario, mes]);

  function toggleCompletado(dia: DiaCalendario) {
    const nuevoCal = plan.calendario.map((d) =>
      d.fecha === dia.fecha ? { ...d, completado: !d.completado } : d
    );
    const nuevo = { ...plan, calendario: nuevoCal, actualizadoEn: new Date().toISOString() };
    guardarPlan(nuevo);
    onUpdate(nuevo);
    setDiaSeleccionado((prev) => prev?.fecha === dia.fecha ? { ...dia, completado: !dia.completado } : prev);
  }

  function posponer(dia: DiaCalendario) {
    // Encontrar el siguiente día disponible para estudiar
    const idxActual = plan.calendario.findIndex((d) => d.fecha === dia.fecha);
    let encontrado = false;

    const nuevoCal = plan.calendario.map((d) => {
      if (d.fecha === dia.fecha) return { ...d, pospuesto: true, temaNumero: undefined, temaNombre: undefined, tipo: 'libre' as const };
      return d;
    });

    // Buscar siguiente día de estudio sin tema asignado para insertar
    for (let i = idxActual + 1; i < plan.calendario.length && !encontrado; i++) {
      const d = plan.calendario[i];
      if (d.tipo !== 'libre' || d.esLibre) continue;
      if (d.horasEstudio > 0 && !d.temaNumero) {
        nuevoCal[i] = {
          ...nuevoCal[i],
          tipo: 'estudio',
          temaNumero: dia.temaNumero,
          temaNombre: dia.temaNombre,
          horasEstudio: dia.horasEstudio,
        };
        encontrado = true;
      }
    }

    const nuevo = { ...plan, calendario: nuevoCal, actualizadoEn: new Date().toISOString() };
    guardarPlan(nuevo);
    onUpdate(nuevo);
    setDiaSeleccionado(null);
  }

  function estilosDia(dia: DiaCalendario | null): React.CSSProperties {
    if (!dia) return {};
    const esHoy = dia.fecha === isoHoy;
    const base: React.CSSProperties = {
      minHeight: 72, padding: '5px 6px', borderRadius: 8,
      border: '1.5px solid',
      cursor: dia.tipo !== 'libre' || dia.repasos.length > 0 ? 'pointer' : 'default',
      position: 'relative', transition: 'all 0.15s',
      outline: esHoy ? '2px solid var(--primary)' : 'none',
      outlineOffset: 1,
    };

    if (dia.tipo === 'examen') return { ...base, background: 'var(--danger-light)', borderColor: 'var(--danger)' };
    if (dia.tipo === 'simulacro') return { ...base, background: 'var(--danger-light)', borderColor: 'var(--warning)' };
    if (dia.tipo === 'repaso-general') return { ...base, background: 'var(--warning-light)', borderColor: 'var(--warning)' };
    if (dia.completado) return { ...base, background: 'var(--success-light)', borderColor: 'var(--success)' };
    if (dia.tipo === 'estudio') return { ...base, background: 'var(--primary-light)', borderColor: 'var(--primary)' };
    if (dia.tipo === 'repaso' || dia.repasos.length > 0) return { ...base, background: 'var(--accent-light)', borderColor: 'var(--accent)' };
    if (dia.esLibre || dia.esFestivo) return { ...base, background: 'var(--secondary)', borderColor: 'var(--card-border)', opacity: 0.7 };
    return { ...base, background: 'var(--background)', borderColor: 'var(--card-border)' };
  }

  const mesAnterior = () => setMes((m) => {
    const d = new Date(m.anio, m.mes - 1, 1);
    return { anio: d.getFullYear(), mes: d.getMonth() };
  });
  const mesSiguiente = () => setMes((m) => {
    const d = new Date(m.anio, m.mes + 1, 1);
    return { anio: d.getFullYear(), mes: d.getMonth() };
  });

  return (
    <div>
      {/* Cabecera mes */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <button className="btn btn-ghost btn-sm" onClick={mesAnterior}><ChevronLeft size={16} /></button>
        <h3 style={{ fontSize: 16, fontWeight: 600 }}>
          {NOMBRES_MES[mes.mes]} {mes.anio}
        </h3>
        <button className="btn btn-ghost btn-sm" onClick={mesSiguiente}><ChevronRight size={16} /></button>
      </div>

      {/* Leyenda */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
        {[
          { color: 'var(--primary)', label: 'Estudio' },
          { color: 'var(--accent)', label: 'Repaso' },
          { color: 'var(--warning)', label: 'Rep. general' },
          { color: 'var(--danger)', label: 'Examen' },
          { color: 'var(--success)', label: 'Completado' },
        ].map(({ color, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: color }} />
            <span style={{ fontSize: 11, color: 'var(--muted)' }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Días cabecera */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4, marginBottom: 4 }}>
        {DIAS_CABECERA.map((d) => (
          <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 600, color: 'var(--muted)', padding: '4px 0' }}>{d}</div>
        ))}
      </div>

      {/* Grid calendario */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4 }}>
        {diasCalendario.map((dia, i) => (
          dia === null
            ? <div key={`empty-${i}`} />
            : (
              <div
                key={dia.fecha}
                style={estilosDia(dia)}
                onClick={() => {
                  if (dia.tipo !== 'libre' || dia.repasos.length > 0) setDiaSeleccionado(dia);
                }}
              >
                {/* Número del día */}
                <div style={{
                  fontSize: 11, fontWeight: 600, color: 'var(--muted)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <span>{parseInt(dia.fecha.split('-')[2])}</span>
                  {dia.completado && <Check size={10} color="var(--success)" />}
                </div>

                {/* Contenido del día */}
                {dia.tipo === 'examen' && (
                  <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--danger)', marginTop: 2 }}>🎯 EXAMEN</div>
                )}
                {dia.tipo === 'estudio' && dia.temaNumero && (
                  <div style={{ fontSize: 9, color: 'var(--primary)', fontWeight: 600, marginTop: 2, lineHeight: 1.3 }}>
                    T.{dia.temaNumero}
                    <div style={{ fontWeight: 400, color: 'var(--muted)', fontSize: 8 }}>{dia.horasEstudio}h</div>
                  </div>
                )}
                {dia.tipo === 'simulacro' && (
                  <div style={{ fontSize: 9, fontWeight: 600, color: 'var(--warning)', marginTop: 2 }}>📝 Simul.</div>
                )}
                {dia.tipo === 'repaso-general' && (
                  <div style={{ fontSize: 9, fontWeight: 600, color: 'var(--warning)', marginTop: 2 }}>🔄 Rep.G</div>
                )}
                {dia.repasos.length > 0 && dia.tipo !== 'examen' && (
                  <div style={{
                    marginTop: 2, fontSize: 8, background: 'var(--accent)',
                    color: 'white', borderRadius: 3, padding: '1px 3px', display: 'inline-block',
                  }}>
                    {dia.repasos.length} rep.
                  </div>
                )}
              </div>
            )
        ))}
      </div>

      {/* Modal día seleccionado */}
      {diaSeleccionado && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 200, padding: 16,
          }}
          onClick={() => setDiaSeleccionado(null)}
        >
          <div
            style={{
              background: 'var(--background)', border: '1px solid var(--card-border)',
              borderRadius: 16, padding: 24, maxWidth: 400, width: '100%',
              boxShadow: 'var(--shadow-lg)', maxHeight: '90vh', overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>
                  {new Date(diaSeleccionado.fecha + 'T12:00:00').toLocaleDateString('es-ES', {
                    weekday: 'long', day: 'numeric', month: 'long',
                  })}
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700 }}>
                  {diaSeleccionado.temaNombre || etiquetaTipo(diaSeleccionado.tipo)}
                </h3>
              </div>
              <div style={{
                padding: '4px 10px', borderRadius: 99, fontSize: 11, fontWeight: 600,
                background: colorTipo(diaSeleccionado.tipo) + '20',
                color: colorTipo(diaSeleccionado.tipo),
              }}>
                {etiquetaTipo(diaSeleccionado.tipo)}
              </div>
            </div>

            {diaSeleccionado.horasEstudio > 0 && (
              <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                <div style={{
                  flex: 1, padding: '10px 12px', borderRadius: 8,
                  background: 'var(--secondary)', textAlign: 'center',
                }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--primary)' }}>{diaSeleccionado.horasEstudio}h</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>Tiempo estimado</div>
                </div>
                {diaSeleccionado.temaNumero && (
                  <div style={{
                    flex: 1, padding: '10px 12px', borderRadius: 8,
                    background: 'var(--secondary)', textAlign: 'center',
                  }}>
                    <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--primary)' }}>#{diaSeleccionado.temaNumero}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>Número de tema</div>
                  </div>
                )}
              </div>
            )}

            {diaSeleccionado.repasos.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--foreground)' }}>
                  Repasos programados
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {diaSeleccionado.repasos.map((r, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '8px 10px', borderRadius: 8,
                      background: 'var(--accent-light)', border: '1px solid var(--accent)',
                    }}>
                      <span style={{ fontSize: 13, color: 'var(--foreground)' }}>
                        Tema {r.numeroTema}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 600 }}>
                        {r.tipo === 'repaso-1' ? '1er repaso' : r.tipo === 'repaso-2' ? '2º repaso' : '3er repaso'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Acciones */}
            {diaSeleccionado.tipo === 'estudio' && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button
                  onClick={() => toggleCompletado(diaSeleccionado)}
                  className="btn"
                  style={{
                    flex: 1, gap: 6,
                    background: diaSeleccionado.completado ? 'var(--success-light)' : 'var(--success)',
                    color: diaSeleccionado.completado ? 'var(--success)' : 'white',
                    border: diaSeleccionado.completado ? '1.5px solid var(--success)' : 'none',
                  }}
                >
                  <Check size={14} />
                  {diaSeleccionado.completado ? 'Desmarcar' : 'Marcar completado'}
                </button>
                {!diaSeleccionado.completado && (
                  <button
                    onClick={() => posponer(diaSeleccionado)}
                    className="btn btn-secondary"
                    style={{ gap: 6 }}
                  >
                    <ArrowRight size={14} /> Posponer
                  </button>
                )}
              </div>
            )}

            <button
              onClick={() => setDiaSeleccionado(null)}
              className="btn btn-ghost"
              style={{ marginTop: 12, width: '100%', fontSize: 13 }}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
