import type { Metadata } from 'next';
import FormularioCrear from '@/components/forms/FormularioCrear';

export const metadata: Metadata = {
  title: 'Crear planificación de oposiciones',
  description: 'Crea tu calendario de estudio personalizado para oposiciones en menos de 1 minuto. Introduce tu examen y tus horas disponibles.',
};

export default function CrearPage() {
  return (
    <div style={{ background: 'var(--secondary)', minHeight: 'calc(100vh - 56px)', paddingBottom: 48 }}>
      <div style={{
        maxWidth: 720, margin: '0 auto', padding: '32px 16px 0',
        textAlign: 'center',
      }}>
        <h1 style={{ fontSize: 'clamp(22px, 4vw, 32px)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 8 }}>
          Crea tu planificación
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: 15 }}>
          Rellena el formulario y tendrás tu calendario listo en segundos
        </p>
      </div>
      <FormularioCrear />
    </div>
  );
}
