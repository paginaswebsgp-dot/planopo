'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FormularioPlan, NivelEstudio, HorasSemanales, DIAS_SEMANA } from '@/types';
import { generarPlanEstudio } from '@/lib/algoritmo';
import { guardarPlan, contarPlanes } from '@/lib/storage';
import { Calendar, BookOpen, Clock, AlertCircle, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';

const PASOS = ['General', 'Horas', 'Días libres', 'Resumen'];

function etiquetaNivel(n: NivelEstudio) {
  return { principiante: 'Principiante (~2.5h/tema)', intermedio: 'Intermedio (~2h/tema)', avanzado: 'Avanzado (~1.5h/tema)' }[n];
}

export default function FormularioCrear() {
  const router = useRouter();
  const [paso, setPaso] = useState(0);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [generando, setGenerando] = useState(false);

  const [form, setForm] = useState<FormularioPlan>({
    nombreOposicion: '',
    fechaExamen: '',
    totalTemas: 50,
    temasEstudiados: 0,
    nivel: 'principiante',
    horasSemanales: { lunes: 2, martes: 2, miercoles: 2, jueves: 2, viernes: 2, sabado: 3, domingo: 2 },
    diasLibres: [],
  });

  // Días libres: picker de fechas del mes actual y siguiente
  const [mesSeleccionado, setMesSeleccionado] = useState(() => {
    const hoy = new Date();
    return { anio: hoy.getFullYear(), mes: hoy.getMonth() };
  });

  const update = (key: keyof FormularioPlan, value: unknown) =>
    setForm((f) => ({ ...f, [key]: value }));

  const updateHoras = (dia: keyof HorasSemanales, val: number) =>
    setForm((f) => ({ ...f, horasSemanales: { ...f.horasSemanales, [dia]: val } }));

  const toggleDiaLibre = (iso: string) => {
    setForm((f) => ({
      ...f,
      diasLibres: f.diasLibres.includes(iso)
        ? f.diasLibres.filter((d) => d !== iso)
        : [...f.diasLibres, iso],
    }));
  };

  function validarPaso(p: number): boolean {
    const errs: Record<string, string> = {};
    if (p === 0) {
      if (!form.nombreOposicion.trim()) errs.nombreOposicion = 'Introduce el nombre';
      if (!form.fechaExamen) {
        errs.fechaExamen = 'Selecciona la fecha del examen';
      } else {
        const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
        const fecha = new Date(form.fechaExamen + 'T00:00:00');
        if (fecha <= hoy) errs.fechaExamen = 'La fecha debe ser futura';
      }
      if (form.totalTemas < 1) errs.totalTemas = 'Mínimo 1 tema';
      if (form.temasEstudiados < 0) errs.temasEstudiados = 'No puede ser negativo';
      if (form.temasEstudiados >= form.totalTemas) errs.temasEstudiados = 'Debe ser menor al total';
    }
    if (p === 1) {
      const total = Object.values(form.horasSemanales).reduce((a, b) => a + b, 0);
      if (total === 0) errs.horas = 'Añade al menos 1 hora de estudio';
    }
    setErrores(errs);
    return Object.keys(errs).length === 0;
  }

  const siguiente = () => { if (validarPaso(paso)) setPaso((p) => p + 1); };
  const anterior = () => { setPaso((p) => p - 1); setErrores({}); };

  function diasDelMes(anio: number, mes: number): string[] {
    const dias: string[] = [];
    const ultimo = new Date(anio, mes + 1, 0).getDate();
    for (let d = 1; d <= ultimo; d++) {
      const iso = `${anio}-${String(mes + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      dias.push(iso);
    }
    return dias;
  }

  function nombreMes(mes: number, anio: number) {
    return new Date(anio, mes, 1).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  }

  async function generar() {
    if (!validarPaso(2)) return;
    setGenerando(true);
    await new Promise((r) => setTimeout(r, 600));
    const plan = generarPlanEstudio(form);
    guardarPlan(plan);
    router.push(`/dashboard?id=${plan.id}`);
  }

  const horasTotal = Object.values(form.horasSemanales).reduce((a, b) => a + b, 0);
  const temasPendientes = form.totalTemas - form.temasEstudiados;

  const diasMes = diasDelMes(mesSeleccionado.anio, mesSeleccionado.mes);
  const primerDia = new Date(mesSeleccionado.anio, mesSeleccionado.mes, 1).getDay();
  const offsetDias = primerDia === 0 ? 6 : primerDia - 1;

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '24px 16px' }}>
      {/* Steps */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 32 }}>
        {PASOS.map((nombre, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < PASOS.length - 1 ? 1 : 'none' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: i <= paso ? 'var(--primary)' : 'var(--card-border)',
                color: i <= paso ? 'white' : 'var(--muted)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 600, transition: 'all 0.3s',
              }}>
                {i < paso ? '✓' : i + 1}
              </div>
              <span style={{ fontSize: 11, color: i === paso ? 'var(--primary)' : 'var(--muted)', fontWeight: i === paso ? 600 : 400 }}>
                {nombre}
              </span>
            </div>
            {i < PASOS.length - 1 && (
              <div style={{
                flex: 1, height: 2, margin: '0 8px', marginBottom: 16,
                background: i < paso ? 'var(--primary)' : 'var(--card-border)',
                transition: 'background 0.3s',
              }} />
            )}
          </div>
        ))}
      </div>

      {/* Card */}
      <div style={{
        background: 'var(--card)', border: '1px solid var(--card-border)',
        borderRadius: 'var(--radius-lg)', padding: 28,
        boxShadow: 'var(--shadow-md)',
      }} className="animate-fadeIn">

        {/* ── Paso 0: Información general ── */}
        {paso === 0 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{ background: 'var(--primary-light)', padding: 8, borderRadius: 8 }}>
                <BookOpen size={18} color="var(--primary)" />
              </div>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700 }}>Información general</h2>
                <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>Cuéntanos sobre tu oposición</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
                  Nombre de la oposición *
                </label>
                <input
                  className="input-field"
                  placeholder="Ej: Auxiliar Administrativo Estado"
                  value={form.nombreOposicion}
                  onChange={(e) => update('nombreOposicion', e.target.value)}
                />
                {errores.nombreOposicion && <p style={{ color: 'var(--danger)', fontSize: 12, marginTop: 4 }}>{errores.nombreOposicion}</p>}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
                  Fecha del examen *
                </label>
                <input
                  type="date"
                  className="input-field"
                  value={form.fechaExamen}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => update('fechaExamen', e.target.value)}
                />
                {errores.fechaExamen && <p style={{ color: 'var(--danger)', fontSize: 12, marginTop: 4 }}>{errores.fechaExamen}</p>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
                    Total de temas *
                  </label>
                  <input
                    type="number" min={1} max={500}
                    className="input-field"
                    value={form.totalTemas}
                    onChange={(e) => update('totalTemas', parseInt(e.target.value) || 1)}
                  />
                  {errores.totalTemas && <p style={{ color: 'var(--danger)', fontSize: 12, marginTop: 4 }}>{errores.totalTemas}</p>}
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
                    Temas ya estudiados
                  </label>
                  <input
                    type="number" min={0} max={form.totalTemas - 1}
                    className="input-field"
                    value={form.temasEstudiados}
                    onChange={(e) => update('temasEstudiados', parseInt(e.target.value) || 0)}
                  />
                  {errores.temasEstudiados && <p style={{ color: 'var(--danger)', fontSize: 12, marginTop: 4 }}>{errores.temasEstudiados}</p>}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 8 }}>
                  Nivel actual
                </label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {(['principiante', 'intermedio', 'avanzado'] as NivelEstudio[]).map((n) => (
                    <button
                      key={n}
                      onClick={() => update('nivel', n)}
                      style={{
                        flex: 1, minWidth: 100, padding: '10px 8px',
                        borderRadius: 8, border: '2px solid',
                        borderColor: form.nivel === n ? 'var(--primary)' : 'var(--card-border)',
                        background: form.nivel === n ? 'var(--primary-light)' : 'var(--background)',
                        color: form.nivel === n ? 'var(--primary)' : 'var(--foreground)',
                        cursor: 'pointer', fontSize: 12, fontWeight: 500,
                        transition: 'all 0.15s',
                      }}
                    >
                      <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
                        {n === 'principiante' ? '~2.5h' : n === 'intermedio' ? '~2h' : '~1.5h'}/tema
                      </div>
                      {n.charAt(0).toUpperCase() + n.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Paso 1: Horas de estudio ── */}
        {paso === 1 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{ background: 'var(--primary-light)', padding: 8, borderRadius: 8 }}>
                <Clock size={18} color="var(--primary)" />
              </div>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700 }}>Horas disponibles</h2>
                <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>¿Cuántas horas puedes estudiar cada día?</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {DIAS_SEMANA.map(({ key, label }) => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ width: 90, fontSize: 14, fontWeight: 500 }}>{label}</span>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                      type="range" min={0} max={12} step={0.5}
                      value={form.horasSemanales[key]}
                      onChange={(e) => updateHoras(key, parseFloat(e.target.value))}
                      style={{ flex: 1, accentColor: 'var(--primary)' }}
                    />
                    <span style={{
                      minWidth: 48, textAlign: 'right', fontSize: 13, fontWeight: 600,
                      color: form.horasSemanales[key] > 0 ? 'var(--primary)' : 'var(--muted-light)',
                    }}>
                      {form.horasSemanales[key] === 0 ? 'Libre' : `${form.horasSemanales[key]}h`}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {errores.horas && (
              <div style={{
                marginTop: 16, padding: '10px 12px', borderRadius: 8,
                background: 'var(--danger-light)', color: 'var(--danger)',
                fontSize: 13, display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <AlertCircle size={14} /> {errores.horas}
              </div>
            )}

            <div style={{
              marginTop: 16, padding: '12px 16px', borderRadius: 8,
              background: 'var(--primary-light)', border: '1px solid var(--primary)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <span style={{ fontSize: 13, color: 'var(--muted)' }}>Total semanal</span>
              <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--primary)' }}>
                {horasTotal}h / semana
              </span>
            </div>
          </div>
        )}

        {/* ── Paso 2: Días libres ── */}
        {paso === 2 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{ background: 'var(--primary-light)', padding: 8, borderRadius: 8 }}>
                <Calendar size={18} color="var(--primary)" />
              </div>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700 }}>Días libres</h2>
                <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>Marca vacaciones, festivos o días sin estudio</p>
              </div>
            </div>

            {/* Selector de mes */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => setMesSeleccionado((m) => {
                const d = new Date(m.anio, m.mes - 1, 1);
                return { anio: d.getFullYear(), mes: d.getMonth() };
              })}>◀</button>
              <span style={{ fontWeight: 600, fontSize: 15, textTransform: 'capitalize' }}>
                {nombreMes(mesSeleccionado.mes, mesSeleccionado.anio)}
              </span>
              <button className="btn btn-ghost btn-sm" onClick={() => setMesSeleccionado((m) => {
                const d = new Date(m.anio, m.mes + 1, 1);
                return { anio: d.getFullYear(), mes: d.getMonth() };
              })}>▶</button>
            </div>

            {/* Grid cabecera */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4, marginBottom: 4 }}>
              {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((d) => (
                <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 600, color: 'var(--muted)', padding: '4px 0' }}>{d}</div>
              ))}
            </div>

            {/* Grid días */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4 }}>
              {Array(offsetDias).fill(null).map((_, i) => <div key={`empty-${i}`} />)}
              {diasMes.map((iso) => {
                const isLibre = form.diasLibres.includes(iso);
                const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
                const esPasado = new Date(iso + 'T00:00:00') < hoy;
                return (
                  <button
                    key={iso}
                    onClick={() => !esPasado && toggleDiaLibre(iso)}
                    disabled={esPasado}
                    style={{
                      padding: '8px 4px', borderRadius: 6, border: '1.5px solid',
                      borderColor: isLibre ? 'var(--warning)' : 'var(--card-border)',
                      background: isLibre ? 'var(--warning-light)' : 'var(--background)',
                      color: esPasado ? 'var(--muted-light)' : isLibre ? 'var(--warning)' : 'var(--foreground)',
                      fontSize: 12, fontWeight: isLibre ? 600 : 400,
                      cursor: esPasado ? 'default' : 'pointer',
                      opacity: esPasado ? 0.4 : 1,
                      transition: 'all 0.15s',
                    }}
                  >
                    {iso.split('-')[2]}
                  </button>
                );
              })}
            </div>

            {form.diasLibres.length > 0 && (
              <div style={{
                marginTop: 12, padding: '10px 12px', borderRadius: 8,
                background: 'var(--warning-light)', color: 'var(--warning)', fontSize: 13,
              }}>
                {form.diasLibres.length} día{form.diasLibres.length !== 1 ? 's' : ''} marcado{form.diasLibres.length !== 1 ? 's' : ''} como libre{form.diasLibres.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        )}

        {/* ── Paso 3: Resumen ── */}
        {paso === 3 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{ background: 'var(--primary-light)', padding: 8, borderRadius: 8 }}>
                <Sparkles size={18} color="var(--primary)" />
              </div>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700 }}>¡Todo listo!</h2>
                <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>Revisa tu planificación antes de generar</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                ['Oposición', form.nombreOposicion],
                ['Fecha examen', form.fechaExamen],
                ['Total temas', String(form.totalTemas)],
                ['Temas pendientes', String(temasPendientes)],
                ['Nivel', form.nivel],
                ['Horas/semana', `${horasTotal}h`],
                ['Días libres marcados', String(form.diasLibres.length)],
              ].map(([k, v]) => (
                <div key={k} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 12px', borderRadius: 8, background: 'var(--secondary)',
                }}>
                  <span style={{ fontSize: 13, color: 'var(--muted)' }}>{k}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--foreground)' }}>{v}</span>
                </div>
              ))}
            </div>

            <div style={{
              marginTop: 16, padding: '12px 16px', borderRadius: 8,
              background: 'var(--primary-light)', border: '1px solid var(--primary)',
              fontSize: 13, color: 'var(--primary)',
            }}>
              <strong>✨ El algoritmo calculará:</strong> repasos espaciados, fase de consolidación,
              simulacros finales y redistribución automática de temas.
            </div>
          </div>
        )}

        {/* Botones navegación */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 28, gap: 12 }}>
          {paso > 0 ? (
            <button onClick={anterior} className="btn btn-secondary" style={{ gap: 6 }}>
              <ChevronLeft size={16} /> Anterior
            </button>
          ) : <div />}

          {paso < PASOS.length - 1 ? (
            <button onClick={siguiente} className="btn btn-primary" style={{ gap: 6 }}>
              Siguiente <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={generar}
              disabled={generando}
              className="btn btn-primary"
              style={{ gap: 8, minWidth: 160 }}
            >
              {generando ? (
                <>
                  <div style={{
                    width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: 'white', borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                  }} />
                  Generando...
                </>
              ) : (
                <><Sparkles size={16} /> Generar planificación</>
              )}
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
