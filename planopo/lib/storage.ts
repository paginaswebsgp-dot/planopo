import { PlanEstudio } from '@/types';

const STORAGE_KEY = 'planopo_planes';
const ACTIVE_KEY = 'planopo_active';

export function guardarPlan(plan: PlanEstudio): void {
  if (typeof window === 'undefined') return;
  const planes = obtenerTodosLosPlanes();
  const idx = planes.findIndex((p) => p.id === plan.id);
  if (idx >= 0) {
    planes[idx] = plan;
  } else {
    planes.push(plan);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(planes));
  localStorage.setItem(ACTIVE_KEY, plan.id);
}

export function obtenerTodosLosPlanes(): PlanEstudio[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function obtenerPlan(id: string): PlanEstudio | null {
  const planes = obtenerTodosLosPlanes();
  return planes.find((p) => p.id === id) || null;
}

export function obtenerPlanActivo(): PlanEstudio | null {
  if (typeof window === 'undefined') return null;
  const id = localStorage.getItem(ACTIVE_KEY);
  if (!id) return null;
  return obtenerPlan(id);
}

export function eliminarPlan(id: string): void {
  if (typeof window === 'undefined') return;
  const planes = obtenerTodosLosPlanes().filter((p) => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(planes));
  const activo = localStorage.getItem(ACTIVE_KEY);
  if (activo === id) {
    localStorage.removeItem(ACTIVE_KEY);
    if (planes.length > 0) localStorage.setItem(ACTIVE_KEY, planes[planes.length - 1].id);
  }
}

export function contarPlanes(): number {
  return obtenerTodosLosPlanes().length;
}
