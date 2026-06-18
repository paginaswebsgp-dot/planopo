import type { Metadata } from 'next';
import { Suspense } from 'react';
import Dashboard from '@/components/dashboard/Dashboard';

export const metadata: Metadata = {
  title: 'Dashboard — Mi planificación',
  description: 'Sigue tu progreso, marca temas completados y gestiona tu planificación de oposiciones.',
};

function LoadingDashboard() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
      <div style={{
        width: 40, height: 40,
        border: '3px solid var(--card-border)',
        borderTopColor: 'var(--primary)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div style={{ background: 'var(--secondary)', minHeight: 'calc(100vh - 56px)', paddingBottom: 48 }}>
      <Suspense fallback={<LoadingDashboard />}>
        <Dashboard />
      </Suspense>
    </div>
  );
}
