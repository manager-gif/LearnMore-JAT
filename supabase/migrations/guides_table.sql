-- ---------------------------------------------------------
-- Tabla: guides
-- Descripcion: Guias academicas con contador de vistas
-- Schema: public
-- Proyecto: LEARNMORE
-- ---------------------------------------------------------

CREATE TABLE public.guides (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  title text NOT NULL,
  desc text NOT NULL,
  detail text,
  career text NOT NULL,
  sem integer NOT NULL DEFAULT 1,
  topics text[] DEFAULT '{}',
  fileUrl text,
  views integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT guides_pkey PRIMARY KEY (id)
)
TABLESPACE pg_default;

-- Índice para filtrar guías por carrera
CREATE INDEX IF NOT EXISTS idx_guides_career
  ON public.guides USING btree (career)
  TABLESPACE pg_default;

-- Índice para filtrar guías por semestre
CREATE INDEX IF NOT EXISTS idx_guides_sem
  ON public.guides USING btree (sem)
  TABLESPACE pg_default;

-- Índice para ordenar guías por vistas (más populares)
CREATE INDEX IF NOT EXISTS idx_guides_views
  ON public.guides USING btree (views DESC)
  TABLESPACE pg_default;

-- Índice para ordenar guías por fecha de creación descendente
CREATE INDEX IF NOT EXISTS idx_guides_created_at
  ON public.guides USING btree (created_at DESC)
  TABLESPACE pg_default;

-- Trigger para actualizar automáticamente updated_at en cada modificación
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON guides
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Habilitar RLS en la tabla
ALTER TABLE public.guides ENABLE ROW LEVEL SECURITY;

-- Política: Permitir lectura pública (cualquiera puede ver guías)
CREATE POLICY "guides_select_policy"
  ON public.guides
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Política: Permitir inserción (admins y usuarios autenticados)
CREATE POLICY "guides_insert_policy"
  ON public.guides
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin'));

-- Política: Solo administradores pueden actualizar
CREATE POLICY "guides_update_policy"
  ON public.guides
  FOR UPDATE
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin'))
  WITH CHECK (auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin'));

-- Política: Solo administradores pueden eliminar
CREATE POLICY "guides_delete_policy"
  ON public.guides
  FOR DELETE
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin'));

-- Política: Permitir incremento de vistas públicamente (trigger function update bypass)
CREATE POLICY "guides_increment_views_policy"
  ON public.guides
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);