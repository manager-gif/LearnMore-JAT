-- ---------------------------------------------------------
-- Migration: Agregar columnas de perfil a users
-- Descripcion: Guarda datos adicionales del usuario (foto, matricula, cuatrimestre, etc.)
-- Schema: public
-- Proyecto: LEARNMORE
-- ---------------------------------------------------------

ALTER TABLE public.users 
  ADD COLUMN IF NOT EXISTS photoData text NULL;

ALTER TABLE public.users 
  ADD COLUMN IF NOT EXISTS studentId text NULL;

ALTER TABLE public.users 
  ADD COLUMN IF NOT EXISTS semester text NULL;

ALTER TABLE public.users 
  ADD COLUMN IF NOT EXISTS career text NULL;

ALTER TABLE public.users 
  ADD COLUMN IF NOT EXISTS phone text NULL;

ALTER TABLE public.users 
  ADD COLUMN IF NOT EXISTS bio text NULL;

-- Permitir a usuarios autenticados actualizar SU PROPIO perfil
CREATE POLICY "users_update_own_policy"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
