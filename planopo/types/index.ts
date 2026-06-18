export type NivelEstudio = 'principiante' | 'intermedio' | 'avanzado';
export type TipoDia = 'estudio' | 'repaso' | 'simulacro' | 'libre' | 'festivo' | 'examen' | 'repaso-general';

export interface HorasSemanales {
  lunes: number;
  martes: number;
  miercoles: number;
  jueves: number;
  viernes: number;
  sabado: number;
  domingo: number;
}

export interface FormularioPlan {
  nombreOposicion: string;
  fechaExamen: string;
  totalTemas: number;
  temasEstudiados: number;
  nivel: NivelEstudio;
  horasSemanales: HorasSemanales;
  diasLibres: string[]; // ISO dates
}

export interface TemaRepaso {
  numeroTema: number;
  fechaRepaso: string;
  tipo: 'repaso-1' | 'repaso-2' | 'repaso-3';
  completado: boolean;
}

export interface DiaCalendario {
  fecha: string; // ISO date YYYY-MM-DD
  tipo: TipoDia;
  temaNumero?: number;
  temaNombre?: string;
  horasEstudio: number;
  repasos: TemaRepaso[];
  completado: boolean;
  pospuesto: boolean;
  esLibre: boolean;
  esFestivo: boolean;
}

export interface ResumenPlan {
  diasHastaExamen: number;
  temasPorSemana: number;
  horasSemanales: number;
  temasPendientes: number;
  temasCompletados: number;
  porcentajeCompletado: number;
  semanasEstudio: number;
  diasEstudio: number;
  horasTotales: number;
}

export interface PlanEstudio {
  id: string;
  formulario: FormularioPlan;
  calendario: DiaCalendario[];
  resumen: ResumenPlan;
  creadoEn: string;
  actualizadoEn: string;
  version: number;
}

export interface EstadisticasDashboard {
  temasCompletados: number;
  temasPendientes: number;
  totalTemas: number;
  porcentajeCompletado: number;
  diasRestantes: number;
  rachaActual: number;
  horasEstudiadas: number;
  repasosPendientes: number;
}

export interface UserPlan {
  planId: string;
  esPremium: boolean;
}

export const DIAS_SEMANA: { key: keyof HorasSemanales; label: string; short: string }[] = [
  { key: 'lunes', label: 'Lunes', short: 'L' },
  { key: 'martes', label: 'Martes', short: 'M' },
  { key: 'miercoles', label: 'Miércoles', short: 'X' },
  { key: 'jueves', label: 'Jueves', short: 'J' },
  { key: 'viernes', label: 'Viernes', short: 'V' },
  { key: 'sabado', label: 'Sábado', short: 'S' },
  { key: 'domingo', label: 'Domingo', short: 'D' },
];

export const NOMBRES_DIA: Record<number, keyof HorasSemanales> = {
  1: 'lunes',
  2: 'martes',
  3: 'miercoles',
  4: 'jueves',
  5: 'viernes',
  6: 'sabado',
  0: 'domingo',
};

export const NIVEL_HORAS_TEMA: Record<NivelEstudio, number> = {
  principiante: 2.5,
  intermedio: 2.0,
  avanzado: 1.5,
};
