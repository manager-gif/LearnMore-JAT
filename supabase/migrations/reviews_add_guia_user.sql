-- ---------------------------------------------------------
-- Migration: Agregar guia_id y user_id a reviews
-- Descripcion: Permite reseñas por guía y trazabilidad de autor
-- Schema: public
-- Proyecto: LEARNMORE
-- ---------------------------------------------------------

-- Agregar columna guia_id para filtrar reseñas por guía
ALTER TABLE public.reviews 
  ADD COLUMN IF NOT EXISTS guia_id uuid NULL;

-- Agregar columna user_id para identificar al autor de la reseña
ALTER TABLE public.reviews 
  ADD COLUMN IF NOT EXISTS user_id uuid NULL;

-- Indices para busquedas eficientes
CREATE INDEX IF NOT EXISTS idx_reviews_guia_id 
  ON public.reviews USING btree (guia_id);

CREATE INDEX IF NOT EXISTS idx_reviews_user_id 
  ON public.reviews USING btree (user_id);

-- Política: Permitir a usuarios autenticados actualizar SUS PROPIAS reseñas
CREATE POLICY "reviews_update_own_policy"
  ON public.reviews
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Política: Permitir a usuarios autenticados eliminar SUS PROPIAS reseñas
CREATE POLICY "reviews_delete_own_policy"
  ON public.reviews
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Mantener las políticas de admin existentes
-- (no las tocamos, siguen aplicando para admins)
