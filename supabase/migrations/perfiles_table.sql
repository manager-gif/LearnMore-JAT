-- ---------------------------------------------------------
-- Tabla: perfiles
-- Descripcion: Perfiles de usuario con foto y nombre publico
-- Schema: public
-- Proyecto: LEARNMORE
-- ---------------------------------------------------------

CREATE TABLE public.perfiles (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  email text NOT NULL UNIQUE,
  nombre text NOT NULL,
  foto_url text NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT perfiles_pkey PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS idx_perfiles_email ON public.perfiles USING btree (email);

ALTER TABLE public.perfiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "perfiles_select_policy"
  ON public.perfiles
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "perfiles_insert_policy"
  ON public.perfiles
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "perfiles_update_policy"
  ON public.perfiles
  FOR UPDATE
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "perfiles_delete_policy"
  ON public.perfiles
  FOR DELETE
  TO anon, authenticated
  WITH CHECK (true);

-- Agregar columna guia_id a reviews para reseñas por guía
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS guia_id bigint NULL;

CREATE INDEX IF NOT EXISTS idx_reviews_guia_id
  ON public.reviews USING btree (guia_id);

-- Habilitar transmision en tiempo real para perfiles
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS public.perfiles;
