# PlanOpo — Planificador de Oposiciones

Genera tu calendario de estudio para oposiciones automáticamente. Sin IA, todo mediante algoritmos y reglas programadas.

## 🚀 Inicio rápido

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

## ⚙️ Tecnologías

- **Next.js 16** con App Router
- **React 19** + **TypeScript**
- **Tailwind CSS v4**
- **date-fns** para manejo de fechas
- **jsPDF** para exportación PDF
- **localStorage** para persistencia (sin backend requerido)

## 📐 Algoritmo de planificación

El algoritmo sigue 6 reglas:

1. **Días restantes** — Calcula el tiempo disponible hasta el examen
2. **Carga semanal** — Determina temas/semana según horas disponibles y nivel
3. **Distribución equilibrada** — Reparte temas uniformemente en días disponibles
4. **Repasos espaciados** — Repaso 1 (día +1), Repaso 2 (+7 días), Repaso 3 (+30 días)
5. **Adaptación automática** — Si hay pocos días, incrementa carga diaria
6. **Fase de consolidación** — Últimas 2 semanas: simulacros y repasos generales

## 📁 Estructura

```
app/
  page.tsx          → Landing page (SEO optimizada)
  crear/page.tsx    → Formulario de creación
  dashboard/page.tsx → Dashboard con calendario
  precios/page.tsx  → Planes y precios
components/
  forms/FormularioCrear.tsx      → Formulario multistep
  calendar/CalendarioInteractivo.tsx → Vista mensual
  dashboard/Dashboard.tsx        → Dashboard completo
  Navbar.tsx / ThemeProvider.tsx
lib/
  algoritmo.ts  → Motor de planificación
  storage.ts    → Persistencia localStorage
  pdf.ts        → Exportación PDF
  utils.ts      → Helpers
types/index.ts  → Tipos TypeScript
```

## 💰 Monetización

- **Plan Gratuito**: 1 planificación activa
- **Plan Premium** (4,99€/mes): planificaciones ilimitadas, PDF, múltiples oposiciones
- Arquitectura preparada para integración con **Stripe**

## 🌐 Deploy en Vercel

```bash
vercel deploy
```

No requiere variables de entorno ni base de datos externa.

## 🎨 Diseño

- Modo oscuro / claro automático
- Mobile-first responsive
- Inspirado en Notion, Linear y Duolingo
