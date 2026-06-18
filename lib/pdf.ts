'use client';
import { PlanEstudio } from '@/types';
import { calcularEstadisticas } from './algoritmo';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

type RGB = [number, number, number];
const C_PRIMARY: RGB = [91, 108, 248];
const C_SUCCESS: RGB = [22, 163, 74];
const C_WARNING: RGB = [217, 119, 6];
const C_DANGER: RGB = [220, 38, 38];
const C_DARK: RGB = [15, 15, 15];
const C_MUTED: RGB = [115, 115, 115];
const C_LIGHT: RGB = [245, 245, 245];
const C_WHITE: RGB = [255, 255, 255];

const MARGIN = 16;
const PAGE_W = 210;
const PAGE_H = 297;
const CONTENT_W = PAGE_W - MARGIN * 2;
const SAFE_BOTTOM = 20;

export async function exportarPDF(plan: PlanEstudio): Promise<void> {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const stats = calcularEstadisticas(plan);

  let y = 0;
  let paginaActual = 1;

  const fill = (c: RGB) => doc.setFillColor(c[0], c[1], c[2]);
  const stroke = (c: RGB) => doc.setDrawColor(c[0], c[1], c[2]);
  const textColor = (c: RGB) => doc.setTextColor(c[0], c[1], c[2]);

  function nuevaPagina() {
    addFooter();
    doc.addPage();
    paginaActual++;
    y = MARGIN;
  }

  function checkSalto(alturaNeeded: number) {
    if (y + alturaNeeded > PAGE_H - SAFE_BOTTOM) nuevaPagina();
  }

  function addFooter() {
    const pages = doc.getNumberOfPages();
    stroke([229, 229, 229]);
    doc.line(MARGIN, PAGE_H - 10, PAGE_W - MARGIN, PAGE_H - 10);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    textColor(C_MUTED);
    doc.text('PlanOpo — Tu planificador de oposiciones', MARGIN, PAGE_H - 6);
    doc.text(`Página ${paginaActual}`, PAGE_W - MARGIN, PAGE_H - 6, { align: 'right' });
  }

  // ── PÁGINA 1: PORTADA ────────────────────────────────────────────────────
  fill(C_PRIMARY);
  doc.rect(0, 0, PAGE_W, 55, 'F');

  textColor(C_WHITE);
  doc.setFontSize(26);
  doc.setFont('helvetica', 'bold');
  doc.text('PlanOpo', MARGIN, 20);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('Tu planificador de oposiciones', MARGIN, 28);

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  const titulo = plan.formulario.nombreOposicion;
  doc.text(titulo, MARGIN, 42);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const fechaGen = format(new Date(), "d 'de' MMMM 'de' yyyy", { locale: es });
  doc.text(`Generado el ${fechaGen}`, PAGE_W - MARGIN, 42, { align: 'right' });

  y = 65;

  // ── RESUMEN ──────────────────────────────────────────────────────────────
  fill(C_LIGHT);
  doc.roundedRect(MARGIN, y, CONTENT_W, 42, 4, 4, 'F');

  textColor(C_DARK);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('RESUMEN DEL PLAN', MARGIN + 6, y + 9);

  const metricasCols = [
    { label: 'Días restantes', value: String(stats.diasRestantes), color: C_DANGER },
    { label: 'Temas pendientes', value: String(stats.temasPendientes), color: C_PRIMARY },
    { label: 'Completado', value: `${stats.porcentajeCompletado}%`, color: C_SUCCESS },
    { label: 'Horas/semana', value: `${plan.resumen.horasSemanales}h`, color: [6, 182, 212] as RGB },
  ];
  const colW = CONTENT_W / 4;
  metricasCols.forEach((col, i) => {
    const cx = MARGIN + 6 + i * colW;
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(col.color[0], col.color[1], col.color[2]);
    doc.text(col.value, cx, y + 26);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    textColor(C_MUTED);
    doc.text(col.label, cx, y + 34);
  });
  y += 50;

  // ── BARRA PROGRESO ───────────────────────────────────────────────────────
  textColor(C_DARK);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Progreso general', MARGIN, y + 4);
  doc.setFontSize(10);
  doc.setTextColor(C_PRIMARY[0], C_PRIMARY[1], C_PRIMARY[2]);
  doc.text(`${stats.porcentajeCompletado}%`, PAGE_W - MARGIN, y + 4, { align: 'right' });

  fill([229, 229, 229]);
  doc.roundedRect(MARGIN, y + 7, CONTENT_W, 7, 3, 3, 'F');
  if (stats.porcentajeCompletado > 0) {
    fill(C_PRIMARY);
    doc.roundedRect(MARGIN, y + 7, CONTENT_W * (stats.porcentajeCompletado / 100), 7, 3, 3, 'F');
  }
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  textColor(C_MUTED);
  doc.text(`${stats.temasCompletados} completados · ${stats.temasPendientes} pendientes · ${stats.totalTemas} totales`, MARGIN, y + 22);
  y += 30;

  // ── ESTADÍSTICAS ─────────────────────────────────────────────────────────
  checkSalto(70);
  textColor(C_DARK);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('ESTADÍSTICAS DETALLADAS', MARGIN, y + 6);
  y += 12;

  const statsData = [
    ['Fecha del examen', format(parseISO(plan.formulario.fechaExamen), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })],
    ['Nivel de preparación', plan.formulario.nivel.charAt(0).toUpperCase() + plan.formulario.nivel.slice(1)],
    ['Total de temas', String(plan.formulario.totalTemas)],
    ['Temas ya estudiados al inicio', String(plan.formulario.temasEstudiados)],
    ['Horas totales disponibles', `${plan.resumen.horasTotales}h`],
    ['Días de estudio disponibles', String(plan.resumen.diasEstudio)],
    ['Semanas de preparación', String(plan.resumen.semanasEstudio)],
    ['Temas por semana estimados', String(plan.resumen.temasPorSemana)],
    ['Racha actual de días', `${stats.rachaActual} días`],
    ['Horas estudiadas', `${stats.horasEstudiadas}h`],
  ];

  statsData.forEach(([label, value], i) => {
    checkSalto(10);
    if (i % 2 === 0) {
      fill(C_LIGHT);
      doc.rect(MARGIN, y - 3, CONTENT_W, 10, 'F');
    }
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    textColor(C_DARK);
    doc.text(label, MARGIN + 3, y + 4);
    doc.setFont('helvetica', 'bold');
    doc.text(value, PAGE_W - MARGIN - 3, y + 4, { align: 'right' });
    y += 10;
  });
  y += 6;

  // ── PÁGINA 2: CALENDARIO ─────────────────────────────────────────────────
  nuevaPagina();

  fill(C_PRIMARY);
  doc.rect(0, 0, PAGE_W, 14, 'F');
  textColor(C_WHITE);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('CALENDARIO DE ESTUDIO', MARGIN, 9.5);
  y = 22;

  // Agrupar días por mes
  const diasConContenido = plan.calendario.filter(d =>
    ['estudio', 'repaso-general', 'simulacro', 'repaso'].includes(d.tipo) || d.repasos.length > 0
  );

  const mesesMap = new Map<string, typeof diasConContenido>();
  diasConContenido.forEach(dia => {
    const clave = dia.fecha.slice(0, 7);
    if (!mesesMap.has(clave)) mesesMap.set(clave, []);
    mesesMap.get(clave)!.push(dia);
  });

  mesesMap.forEach((dias, mesKey) => {
    const [anio, mes] = mesKey.split('-').map(Number);
    const nombreMes = format(new Date(anio, mes - 1, 1), "MMMM yyyy", { locale: es });
    const nombreMesCap = nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1);

    checkSalto(16);
    fill(C_LIGHT);
    doc.rect(MARGIN, y, CONTENT_W, 12, 'F');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    textColor(C_PRIMARY);
    doc.text(nombreMesCap, MARGIN + 4, y + 8);
    y += 16;

    dias.forEach(dia => {
      checkSalto(12);
      const fechaLabel = format(parseISO(dia.fecha), "EEE d", { locale: es });
      const fechaCap = fechaLabel.charAt(0).toUpperCase() + fechaLabel.slice(1);

      const coloresMap: Record<string, RGB> = {
        estudio: C_PRIMARY,
        'repaso-general': C_WARNING,
        simulacro: C_DANGER,
        repaso: [6, 182, 212],
        examen: C_DANGER,
      };
      const color = coloresMap[dia.tipo] || C_MUTED;

      doc.setFillColor(color[0], color[1], color[2]);
      doc.circle(MARGIN + 3, y + 3, 2.5, 'F');

      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      textColor(C_DARK);
      doc.text(fechaCap, MARGIN + 9, y + 5);

      const nombre = dia.temaNombre ||
        (dia.tipo === 'repaso' ? `${dia.repasos.length} repaso(s): T.${dia.repasos.map(r => r.numeroTema).join(', T.')}` : dia.tipo);
      doc.setFont('helvetica', 'normal');
      textColor(C_MUTED);
      doc.text(nombre, MARGIN + 38, y + 5, { maxWidth: CONTENT_W - 70 });

      if (dia.horasEstudio > 0) {
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(color[0], color[1], color[2]);
        doc.text(`${dia.horasEstudio}h`, PAGE_W - MARGIN - 2, y + 5, { align: 'right' });
      }
      if (dia.completado) {
        doc.setFontSize(7);
        textColor(C_SUCCESS);
        doc.text('✓', MARGIN + 30, y + 5);
      }
      y += 11;
    });
    y += 4;
  });

  // ── PÁGINA 3: PLAN SEMANAL ───────────────────────────────────────────────
  nuevaPagina();
  fill(C_PRIMARY);
  doc.rect(0, 0, PAGE_W, 14, 'F');
  textColor(C_WHITE);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('PLAN SEMANAL — PRÓXIMAS 8 SEMANAS', MARGIN, 9.5);
  y = 22;

  const hoyStr = format(new Date(), 'yyyy-MM-dd');
  const proximasTareas = plan.calendario
    .filter(d => d.fecha >= hoyStr && ['estudio', 'repaso-general', 'simulacro'].includes(d.tipo))
    .slice(0, 56);

  // Agrupar por semana
  const semanasMap = new Map<number, typeof proximasTareas>();
  proximasTareas.forEach(dia => {
    const fecha = parseISO(dia.fecha);
    const inicioAnio = new Date(fecha.getFullYear(), 0, 1);
    const semana = Math.ceil(((fecha.getTime() - inicioAnio.getTime()) / 86400000 + inicioAnio.getDay() + 1) / 7);
    if (!semanasMap.has(semana)) semanasMap.set(semana, []);
    semanasMap.get(semana)!.push(dia);
  });

  let semanaNum = 1;
  semanasMap.forEach((dias) => {
    if (semanaNum > 8) return;
    const primerDia = format(parseISO(dias[0].fecha), "d MMM", { locale: es });
    const ultimoDia = format(parseISO(dias[dias.length - 1].fecha), "d MMM", { locale: es });

    checkSalto(14);
    fill(C_LIGHT);
    doc.rect(MARGIN, y, CONTENT_W, 11, 'F');
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'bold');
    textColor(C_DARK);
    doc.text(`Semana ${semanaNum}  ·  ${primerDia} – ${ultimoDia}`, MARGIN + 4, y + 7.5);
    const horasSemana = dias.reduce((s, d) => s + d.horasEstudio, 0);
    textColor(C_PRIMARY);
    doc.text(`${horasSemana}h`, PAGE_W - MARGIN - 4, y + 7.5, { align: 'right' });
    y += 14;

    dias.forEach(dia => {
      checkSalto(10);
      const fechaLabel = format(parseISO(dia.fecha), 'EEE d', { locale: es });
      const col: RGB = dia.tipo === 'simulacro' ? C_DANGER : dia.tipo === 'repaso-general' ? C_WARNING : C_PRIMARY;

      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      textColor(C_MUTED);
      doc.text(fechaLabel.charAt(0).toUpperCase() + fechaLabel.slice(1), MARGIN + 4, y + 4);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(col[0], col[1], col[2]);
      doc.text(dia.temaNombre || dia.tipo, MARGIN + 28, y + 4);
      if (dia.horasEstudio > 0) {
        doc.setFont('helvetica', 'normal');
        textColor(C_MUTED);
        doc.text(`${dia.horasEstudio}h`, PAGE_W - MARGIN - 4, y + 4, { align: 'right' });
      }
      y += 9;
    });
    y += 3;
    semanaNum++;
  });

  // Footer última página
  addFooter();

  doc.save(`PlanOpo_${plan.formulario.nombreOposicion.replace(/\s+/g, '_')}.pdf`);
}
