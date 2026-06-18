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

export async function exportarPDF(plan: PlanEstudio): Promise<void> {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const stats = calcularEstadisticas(plan);
  const ancho = 210;
  const margen = 16;
  let y = 0;

  const fill = (c: RGB) => doc.setFillColor(c[0], c[1], c[2]);
  const text = (c: RGB) => doc.setTextColor(c[0], c[1], c[2]);

  // ── Header ──────────────────────────────────────────────────────────────
  fill(C_PRIMARY);
  doc.rect(0, 0, ancho, 40, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('PlanOpo', margen, 16);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Tu planificador de oposiciones', margen, 23);

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(plan.formulario.nombreOposicion, margen, 33);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const fechaGen = format(new Date(), "d 'de' MMMM 'de' yyyy", { locale: es });
  doc.text(`Generado el ${fechaGen}`, ancho - margen, 33, { align: 'right' });

  y = 50;

  // ── Resumen ──────────────────────────────────────────────────────────────
  fill(C_LIGHT);
  doc.roundedRect(margen, y, ancho - margen * 2, 38, 3, 3, 'F');

  text(C_DARK);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('RESUMEN DEL PLAN', margen + 4, y + 8);

  const cols = [
    { label: 'Días restantes', value: String(stats.diasRestantes) },
    { label: 'Temas pendientes', value: String(stats.temasPendientes) },
    { label: 'Completado', value: `${stats.porcentajeCompletado}%` },
    { label: 'Horas/semana', value: String(plan.resumen.horasSemanales) },
  ];

  const colW = (ancho - margen * 2 - 8) / 4;
  cols.forEach((col, i) => {
    const cx = margen + 4 + i * colW;
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(C_PRIMARY[0], C_PRIMARY[1], C_PRIMARY[2]);
    doc.text(col.value, cx, y + 22);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    text(C_MUTED);
    doc.text(col.label, cx, y + 30);
  });

  y += 46;

  // ── Barra progreso ──────────────────────────────────────────────────────
  text(C_DARK);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Progreso general', margen, y + 4);

  const barW = ancho - margen * 2;
  doc.setFillColor(229, 229, 229);
  doc.roundedRect(margen, y + 8, barW, 6, 3, 3, 'F');

  const pct = stats.porcentajeCompletado / 100;
  if (pct > 0) {
    fill(C_PRIMARY);
    doc.roundedRect(margen, y + 8, barW * pct, 6, 3, 3, 'F');
  }

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  text(C_MUTED);
  doc.text(`${stats.temasCompletados} de ${stats.totalTemas} temas completados`, margen, y + 22);

  y += 30;

  // ── Estadísticas ──────────────────────────────────────────────────────────
  text(C_DARK);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('ESTADÍSTICAS', margen, y + 4);
  y += 8;

  const statsRows = [
    ['Fecha del examen', format(parseISO(plan.formulario.fechaExamen), 'd MMMM yyyy', { locale: es })],
    ['Nivel', plan.formulario.nivel.charAt(0).toUpperCase() + plan.formulario.nivel.slice(1)],
    ['Total de temas', String(plan.formulario.totalTemas)],
    ['Temas ya estudiados', String(plan.formulario.temasEstudiados)],
    ['Horas totales estimadas', `${plan.resumen.horasTotales}h`],
    ['Días de estudio disponibles', String(plan.resumen.diasEstudio)],
  ];

  statsRows.forEach(([label, value], i) => {
    const rowY = y + i * 9;
    if (i % 2 === 0) {
      fill(C_LIGHT);
      doc.rect(margen, rowY - 4, ancho - margen * 2, 9, 'F');
    }
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    text(C_DARK);
    doc.text(label, margen + 2, rowY + 2);
    doc.setFont('helvetica', 'bold');
    doc.text(value, ancho - margen - 2, rowY + 2, { align: 'right' });
  });

  y += statsRows.length * 9 + 8;

  // ── Próximas tareas ──────────────────────────────────────────────────────
  text(C_DARK);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('PRÓXIMAS TAREAS', margen, y + 4);
  y += 10;

  const hoy = format(new Date(), 'yyyy-MM-dd');
  const proximas = plan.calendario
    .filter((d) => d.fecha >= hoy && ['estudio', 'repaso-general', 'simulacro'].includes(d.tipo))
    .slice(0, 20);

  const coloresMap: Record<string, RGB> = {
    estudio: C_PRIMARY,
    'repaso-general': C_WARNING,
    simulacro: C_DANGER,
  };

  proximas.forEach((dia, i) => {
    if (y > 260) { doc.addPage(); y = 20; }
    const rowY = y + i * 11;
    const color = coloresMap[dia.tipo] || C_MUTED;

    doc.setFillColor(color[0], color[1], color[2]);
    doc.circle(margen + 4, rowY + 2, 2, 'F');

    const fechaLabel = format(parseISO(dia.fecha), 'EEE d MMM', { locale: es });
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    text(C_DARK);
    doc.text(fechaLabel, margen + 9, rowY + 3);

    doc.setFont('helvetica', 'normal');
    text(C_MUTED);
    const nombre = dia.temaNombre || dia.tipo;
    doc.text(nombre, margen + 44, rowY + 3);

    if (dia.horasEstudio > 0) {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(color[0], color[1], color[2]);
      doc.text(`${dia.horasEstudio}h`, ancho - margen - 2, rowY + 3, { align: 'right' });
    }
  });

  // ── Footer ────────────────────────────────────────────────────────────────
  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    doc.setDrawColor(229, 229, 229);
    doc.line(margen, 285, ancho - margen, 285);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    text(C_MUTED);
    doc.text('PlanOpo — Tu planificador de oposiciones', margen, 290);
    doc.text(`Página ${p} de ${pages}`, ancho - margen, 290, { align: 'right' });
  }

  doc.save(`PlanOpo_${plan.formulario.nombreOposicion.replace(/\s+/g, '_')}.pdf`);
}
