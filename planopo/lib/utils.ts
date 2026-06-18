import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatearFecha(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  return `${d} ${meses[m - 1]} ${y}`;
}

export function formatearFechaLarga(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  return `${d} de ${meses[m - 1]} de ${y}`;
}

export function colorTipo(tipo: string): string {
  switch (tipo) {
    case 'estudio': return 'var(--primary)';
    case 'repaso': return 'var(--accent)';
    case 'repaso-general': return 'var(--warning)';
    case 'simulacro': return 'var(--danger)';
    case 'examen': return 'var(--danger)';
    case 'libre': return 'var(--muted-light)';
    default: return 'var(--muted-light)';
  }
}

export function etiquetaTipo(tipo: string): string {
  switch (tipo) {
    case 'estudio': return 'Estudio';
    case 'repaso': return 'Repaso';
    case 'repaso-general': return 'Repaso general';
    case 'simulacro': return 'Simulacro';
    case 'examen': return 'EXAMEN';
    case 'libre': return 'Libre';
    case 'festivo': return 'Festivo';
    default: return tipo;
  }
}

export function pluralizar(n: number, singular: string, plural: string): string {
  return `${n} ${n === 1 ? singular : plural}`;
}
