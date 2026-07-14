-- ---------------------------------------------------------
-- Tabla: reviews
-- Descripcion: Reseñas y calificaciones de usuarios con soporte de moderación
-- Schema: public
-- Proyecto: LEARNMORE
-- ---------------------------------------------------------

CREATE TABLE public.reviews (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  name text NOT NULL,
  comment text NOT NULL,
  stars smallint NOT NULL,
  email text NULL,
  status text NULL DEFAULT 'nuevo'::text,
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  reply text NULL,
  replied_at timestamp with time zone NULL,
  replied_by text NULL,
  CONSTRAINT reviews_pkey PRIMARY KEY (id),
  CONSTRAINT reviews_email_check CHECK (
    (
      email ~* '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$'::text
    )
  ),
  CONSTRAINT reviews_stars_check CHECK (
    (
      (stars >= 1)
      AND (stars <= 5)
    )
  )
)
TABLESPACE pg_default;

-- Índice para filtrar reseñas por estado (nuevo, aprobado, rechazado)
CREATE INDEX IF NOT EXISTS idx_reviews_status
  ON public.reviews USING btree (status)
  TABLESPACE pg_default;

-- Índice para ordenar reseñas por fecha de creación descendente
CREATE INDEX IF NOT EXISTS idx_reviews_created_at
  ON public.reviews USING btree (created_at DESC)
  TABLESPACE pg_default;

-- Trigger para actualizar automáticamente updated_at en cada modificación
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Habilitar RLS en la tabla
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Política: Permitir inserción pública (cualquiera puede crear reseñas sin autenticación)
CREATE POLICY "reviews_insert_policy"
  ON public.reviews
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Política: Permitir lectura pública (cualquiera puede ver reseñas)
CREATE POLICY "reviews_select_policy"
  ON public.reviews
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Política: Solo administradores pueden actualizar
CREATE POLICY "reviews_update_admin_policy"
  ON public.reviews
  FOR UPDATE
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin'))
  WITH CHECK (auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin'));

-- Política: Solo administradores pueden eliminar
CREATE POLICY "reviews_delete_admin_policy"
  ON public.reviews
  FOR DELETE
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin'));

-- ==========================================
-- RLS POLICIES FOR GUIDES TABLE (existing table)
-- ==========================================

-- Habilitar RLS en la tabla guides existente
ALTER TABLE public.guides ENABLE ROW LEVEL SECURITY;

-- Política: Lectura pública
CREATE POLICY "guides_select_policy"
  ON public.guides
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Política: Inserción solo para admins (usando service_role o admin usuarios)
CREATE POLICY "guides_insert_policy"
  ON public.guides
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin'));

-- Política: Actualización solo para admins
CREATE POLICY "guides_update_policy"
  ON public.guides
  FOR UPDATE
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin'))
  WITH CHECK (auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin'));

-- Política: Eliminación solo para admins
CREATE POLICY "guides_delete_policy"
  ON public.guides
  FOR DELETE
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin'));

-- Política para incrementar vistas (bypass RLS via service role)
CREATE POLICY "guides_views_increment_policy"
  ON public.guides
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

  -- ... (Todo el código que me pasaste se queda igual arriba) ...

-- Política para incrementar vistas (bypass RLS via service role)
CREATE POLICY "guides_views_increment_policy"
  ON public.guides
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);



-- 1. Función RPC para incrementar vistas soportando de manera segura el tipo BIGINT
CREATE OR REPLACE FUNCTION public.increment_views(row_id bigint)
RETURNS void AS $$
BEGIN
  UPDATE public.guides
  SET views = COALESCE(views, 0) + 1
  WHERE id = row_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Habilitar la transmisión en Tiempo Real para ambas tablas en Supabase
-- Elimina las tablas de la publicación si ya existían para evitar duplicados
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.reviews, public.guides;

-- Añade ambas tablas al canal de publicaciones en tiempo real
ALTER PUBLICATION supabase_realtime ADD TABLE public.reviews, public.guides;