-- =====================================================
-- PlanOpo — Script de configuración de base de datos
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- =====================================================

-- 1. Tabla de perfiles (extiende auth.users de Supabase)
CREATE TABLE IF NOT EXISTS public.perfiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  es_premium BOOLEAN DEFAULT FALSE,
  exportaciones_pdf INTEGER DEFAULT 0,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  premium_desde TIMESTAMPTZ,
  creado_en TIMESTAMPTZ DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Habilitar Row Level Security
ALTER TABLE public.perfiles ENABLE ROW LEVEL SECURITY;

-- 3. Políticas de seguridad
-- El usuario solo puede ver y editar su propio perfil
CREATE POLICY "usuarios_ven_su_perfil"
  ON public.perfiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "usuarios_editan_su_perfil"
  ON public.perfiles FOR UPDATE
  USING (auth.uid() = id);

-- El service_role (backend) puede hacer todo
CREATE POLICY "service_role_todo"
  ON public.perfiles
  USING (auth.role() = 'service_role');

-- 4. Función que crea el perfil automáticamente al registrarse
CREATE OR REPLACE FUNCTION public.crear_perfil_usuario()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.perfiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Trigger que ejecuta la función al crear usuario
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.crear_perfil_usuario();

-- 6. Función para actualizar timestamp
CREATE OR REPLACE FUNCTION public.actualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.actualizado_en = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER actualizar_perfiles_timestamp
  BEFORE UPDATE ON public.perfiles
  FOR EACH ROW
  EXECUTE FUNCTION public.actualizar_timestamp();

-- ✅ Listo. La base de datos está configurada.
-- Los perfiles se crean automáticamente cuando alguien se registra.
