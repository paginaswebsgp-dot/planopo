import type { Metadata } from 'next';
import PreciosClient from './PreciosClient';

export const metadata: Metadata = {
  title: 'Precios — PlanOpo',
  description: 'Empieza gratis con tu primera planificación. Desbloquea planificaciones ilimitadas, exportación PDF y más con el plan Premium por 4,99€/mes.',
};

export default function PreciosPage() {
  return <PreciosClient />;
}
