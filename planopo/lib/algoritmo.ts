import {
  FormularioPlan,
  DiaCalendario,
  PlanEstudio,
  ResumenPlan,
  TemaRepaso,
  TipoDia,
  NOMBRES_DIA,
  NIVEL_HORAS_TEMA,
} from '@/types';
import { addDays, differenceInCalendarDays, format, parseISO, getDay, startOfDay } from 'date-fns';

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function isoDate(d: Date): string {
  return format(d, 'yyyy-MM-dd');
}

function horasDisponiblesEnDia(fecha: Date, formulario: FormularioPlan): number {
  const diaSemana = getDay(fecha); // 0=Dom,1=Lun,...
  const keyDia = NOMBRES_DIA[diaSemana];
  return formulario.horasSemanales[keyDia] || 0;
}

function esLibreOFestivo(fechaStr: string, formulario: FormularioPlan): boolean {
  return formulario.diasLibres.includes(fechaStr);
}

function generarId(): string {
  return Math.random().toString(36).slice(2, 11) + Date.now().toString(36);
}

// ─── Algoritmo Principal ──────────────────────────────────────────────────────

export function generarPlanEstudio(formulario: FormularioPlan): PlanEstudio {
  const hoy = startOfDay(new Date());
  const fechaExamen = startOfDay(parseISO(formulario.fechaExamen));
  const diasTotales = differenceInCalendarDays(fechaExamen, hoy);

  // Regla 6: Reservar últimas semanas para consolidación
  const semanasFinales = diasTotales > 60 ? 2 : diasTotales > 30 ? 1 : 0;
  const diasFaseConsolidacion = semanasFinales * 7;
  const fechaInicioConsolidacion = addDays(fechaExamen, -(diasFaseConsolidacion));

  // Tema por número
  const horasPerTema = NIVEL_HORAS_TEMA[formulario.nivel];
  const temasPendientes = formulario.totalTemas - formulario.temasEstudiados;

  // Construir lista de días disponibles para estudio (antes de consolidación)
  const diasEstudio: Date[] = [];
  for (let i = 0; i < diasTotales; i++) {
    const d = addDays(hoy, i);
    if (d >= fechaInicioConsolidacion) break;
    const fechaStr = isoDate(d);
    if (esLibreOFestivo(fechaStr, formulario)) continue;
    const horas = horasDisponiblesEnDia(d, formulario);
    if (horas > 0) diasEstudio.push(d);
  }

  // Regla 5: Si pocos días, lanzar advertencia (guardada en resumen)
  const diasDisponibles = diasEstudio.length;

  // Horas totales disponibles en fase estudio
  let horasTotalesDisponibles = diasEstudio.reduce((sum, d) => {
    return sum + horasDisponiblesEnDia(d, formulario);
  }, 0);

  // Horas necesarias para todos los temas
  const horasNecesarias = temasPendientes * horasPerTema;

  // Regla 3: Distribuir temas equilibradamente
  // Agrupar días en slots de tema: cada tema requiere horasPerTema horas
  // Asignamos temas secuencialmente llenando días

  interface TemaAsignacion {
    tema: number;
    dias: Date[];
    horasPorDia: number[];
  }

  const temas: TemaAsignacion[] = [];
  let diaIdx = 0;
  let horasAcumuladas = 0;
  let horasActualDia = horasDisponiblesEnDia(diasEstudio[0] || hoy, formulario);
  let horasUsadasHoy = 0;

  for (let t = 1; t <= temasPendientes; t++) {
    const tema: TemaAsignacion = { tema: formulario.temasEstudiados + t, dias: [], horasPorDia: [] };
    let horasRestanteTema = horasPerTema;

    while (horasRestanteTema > 0 && diaIdx < diasEstudio.length) {
      const diaActual = diasEstudio[diaIdx];
      const horasLibresHoy = horasActualDia - horasUsadasHoy;
      const horasPoner = Math.min(horasRestanteTema, horasLibresHoy);

      if (horasPoner > 0) {
        tema.dias.push(diaActual);
        tema.horasPorDia.push(Math.round(horasPoner * 10) / 10);
        horasUsadasHoy += horasPoner;
        horasRestanteTema -= horasPoner;
      }

      if (horasUsadasHoy >= horasActualDia - 0.01) {
        diaIdx++;
        horasUsadasHoy = 0;
        if (diaIdx < diasEstudio.length) {
          horasActualDia = horasDisponiblesEnDia(diasEstudio[diaIdx], formulario);
        }
      }
    }

    temas.push(tema);
    if (diaIdx >= diasEstudio.length && horasRestanteTema > 0) break;
  }

  // ─── Mapa de días → actividades ──────────────────────────────────────────

  const mapaCalendario: Map<string, DiaCalendario> = new Map();

  const crearDia = (fecha: Date): DiaCalendario => ({
    fecha: isoDate(fecha),
    tipo: 'libre',
    horasEstudio: 0,
    repasos: [],
    completado: false,
    pospuesto: false,
    esLibre: esLibreOFestivo(isoDate(fecha), formulario),
    esFestivo: false,
  });

  const obtenerOCrearDia = (fecha: Date): DiaCalendario => {
    const key = isoDate(fecha);
    if (!mapaCalendario.has(key)) {
      mapaCalendario.set(key, crearDia(fecha));
    }
    return mapaCalendario.get(key)!;
  };

  // Asignar temas a días
  temas.forEach(({ tema, dias, horasPorDia }, idx) => {
    // Usamos el primer día como día principal del tema
    if (dias.length === 0) return;
    const diaP = obtenerOCrearDia(dias[0]);
    diaP.temaNumero = tema;
    diaP.temaNombre = `Tema ${tema}`;
    diaP.tipo = 'estudio';
    diaP.horasEstudio = horasPorDia.reduce((a, b) => a + b, 0);

    // Regla 4: Repasos espaciados
    const fechaBase = dias[0];

    // Repaso 1: día siguiente
    const r1 = addDays(fechaBase, 1);
    if (r1 < fechaExamen) {
      const diaR1 = obtenerOCrearDia(r1);
      diaR1.repasos.push({
        numeroTema: tema,
        fechaRepaso: isoDate(r1),
        tipo: 'repaso-1',
        completado: false,
      });
      if (diaR1.tipo === 'libre') diaR1.tipo = 'repaso';
    }

    // Repaso 2: 7 días
    const r2 = addDays(fechaBase, 7);
    if (r2 < fechaExamen) {
      const diaR2 = obtenerOCrearDia(r2);
      diaR2.repasos.push({
        numeroTema: tema,
        fechaRepaso: isoDate(r2),
        tipo: 'repaso-2',
        completado: false,
      });
      if (diaR2.tipo === 'libre') diaR2.tipo = 'repaso';
    }

    // Repaso 3: 30 días
    const r3 = addDays(fechaBase, 30);
    if (r3 < fechaExamen) {
      const diaR3 = obtenerOCrearDia(r3);
      diaR3.repasos.push({
        numeroTema: tema,
        fechaRepaso: isoDate(r3),
        tipo: 'repaso-3',
        completado: false,
      });
      if (diaR3.tipo === 'libre') diaR3.tipo = 'repaso';
    }
  });

  // Fase consolidación (últimas semanas)
  for (let i = 0; i < diasFaseConsolidacion; i++) {
    const d = addDays(fechaInicioConsolidacion, i);
    if (isoDate(d) === isoDate(fechaExamen)) continue;
    const fechaStr = isoDate(d);
    if (esLibreOFestivo(fechaStr, formulario)) continue;
    const horas = horasDisponiblesEnDia(d, formulario);
    if (horas === 0) continue;

    const dia = obtenerOCrearDia(d);
    if (i % 7 < 4) {
      // Repaso general los primeros 4 días
      if (dia.tipo === 'libre' || dia.tipo === 'repaso') {
        dia.tipo = 'repaso-general';
        dia.temaNombre = 'Repaso general';
        dia.horasEstudio = horas;
      }
    } else {
      // Simulacro los últimos 3 días
      if (dia.tipo === 'libre' || dia.tipo === 'repaso') {
        dia.tipo = 'simulacro';
        dia.temaNombre = 'Simulacro de examen';
        dia.horasEstudio = horas;
      }
    }
  }

  // Marcar días libres/festivos correctamente
  formulario.diasLibres.forEach((fechaStr) => {
    const d = parseISO(fechaStr);
    if (d >= hoy && d < fechaExamen) {
      const dia = obtenerOCrearDia(d);
      dia.tipo = 'libre';
      dia.esLibre = true;
      dia.horasEstudio = 0;
    }
  });

  // Día del examen
  const diaExamen = obtenerOCrearDia(fechaExamen);
  diaExamen.tipo = 'examen';
  diaExamen.temaNombre = '🎯 EXAMEN';
  diaExamen.horasEstudio = 0;

  // Construir array ordenado de días (de hoy al examen)
  const calendario: DiaCalendario[] = [];
  for (let i = 0; i <= diasTotales; i++) {
    const d = addDays(hoy, i);
    const fechaStr = isoDate(d);
    const dia = mapaCalendario.get(fechaStr) || crearDia(d);

    // Días sin horas que no tienen contenido → libre
    if (dia.tipo === 'libre' || dia.tipo === 'repaso') {
      const horas = horasDisponiblesEnDia(d, formulario);
      if (horas === 0 && !esLibreOFestivo(fechaStr, formulario)) {
        dia.esLibre = true;
      }
    }

    // Calcular horas de repaso
    if (dia.repasos.length > 0 && dia.tipo === 'repaso') {
      dia.horasEstudio = Math.min(dia.repasos.length * 0.5, horasDisponiblesEnDia(d, formulario));
    }

    calendario.push(dia);
  }

  // ─── Resumen ──────────────────────────────────────────────────────────────

  const temasAsignados = temas.length;
  const horasSemana = Object.values(formulario.horasSemanales).reduce((a, b) => a + b, 0);

  const resumen: ResumenPlan = {
    diasHastaExamen: diasTotales,
    temasPorSemana: horasSemana > 0 ? Math.round((horasSemana / horasPerTema) * 10) / 10 : 0,
    horasSemanales: horasSemana,
    temasPendientes,
    temasCompletados: formulario.temasEstudiados,
    porcentajeCompletado: Math.round((formulario.temasEstudiados / formulario.totalTemas) * 100),
    semanasEstudio: Math.floor(diasDisponibles / 7),
    diasEstudio: diasDisponibles,
    horasTotales: Math.round(horasTotalesDisponibles),
  };

  return {
    id: generarId(),
    formulario,
    calendario,
    resumen,
    creadoEn: new Date().toISOString(),
    actualizadoEn: new Date().toISOString(),
    version: 1,
  };
}

// ─── Replanificación ──────────────────────────────────────────────────────────

export function replanificar(planActual: PlanEstudio): PlanEstudio {
  // Calcular temas realmente completados
  const temasCompletados = new Set<number>();
  planActual.calendario.forEach((dia) => {
    if (dia.completado && dia.temaNumero) {
      temasCompletados.add(dia.temaNumero);
    }
  });

  const nuevoFormulario: FormularioPlan = {
    ...planActual.formulario,
    temasEstudiados: temasCompletados.size + planActual.formulario.temasEstudiados,
  };

  const nuevoPlan = generarPlanEstudio(nuevoFormulario);
  return {
    ...nuevoPlan,
    id: planActual.id,
    creadoEn: planActual.creadoEn,
    version: planActual.version + 1,
  };
}

// ─── Estadísticas ─────────────────────────────────────────────────────────────

export function calcularEstadisticas(plan: PlanEstudio) {
  const hoy = isoDate(startOfDay(new Date()));
  let temasCompletados = plan.formulario.temasEstudiados;
  let repasosPendientes = 0;
  let horasEstudiadas = 0;
  let rachaActual = 0;
  let contandoRacha = true;

  // Iterar desde el final hacia atrás para calcular racha
  const diasPasados = plan.calendario.filter((d) => d.fecha <= hoy && d.tipo === 'estudio');
  for (let i = diasPasados.length - 1; i >= 0; i--) {
    if (diasPasados[i].completado && contandoRacha) {
      rachaActual++;
    } else {
      contandoRacha = false;
    }
  }

  plan.calendario.forEach((dia) => {
    if (dia.completado) {
      if (dia.temaNumero) temasCompletados++;
      horasEstudiadas += dia.horasEstudio;
    }
    if (dia.fecha <= hoy) {
      dia.repasos.forEach((r) => {
        if (!r.completado) repasosPendientes++;
      });
    }
  });

  const diasRestantes = differenceInCalendarDays(
    parseISO(plan.formulario.fechaExamen),
    startOfDay(new Date())
  );

  return {
    temasCompletados,
    temasPendientes: plan.formulario.totalTemas - temasCompletados,
    totalTemas: plan.formulario.totalTemas,
    porcentajeCompletado: Math.round((temasCompletados / plan.formulario.totalTemas) * 100),
    diasRestantes: Math.max(0, diasRestantes),
    rachaActual,
    horasEstudiadas: Math.round(horasEstudiadas * 10) / 10,
    repasosPendientes,
  };
}
