-- ---------------------------------------------------------
-- Tabla: careers
-- Descripcion: Carreras academicas disponibles
-- Schema: public
-- Proyecto: LEARNMORE
-- ---------------------------------------------------------

CREATE TABLE public.careers (
  id text NOT NULL,
  key text NOT NULL,
  name text NOT NULL,
  desc text,
  color text DEFAULT '#00d4ff',
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT careers_pkey PRIMARY KEY (id)
)
TABLESPACE pg_default;

-- Índice para búsquedas por clave
CREATE INDEX IF NOT EXISTS idx_careers_key ON public.careers USING btree (key);

-- Trigger para actualizar automáticamente updated_at
CREATE TRIGGER set_updated_at ON public.careers
  BEFORE UPDATE FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

ALTER TABLE public.careers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "careers_select_policy" ON public.careers FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "careers_insert_policy" ON public.careers FOR INSERT TO authenticated WITH CHECK (auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin'));
CREATE POLICY "careers_update_policy" ON public.careers FOR UPDATE TO authenticated USING (auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin')) WITH CHECK (auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin'));
CREATE POLICY "careers_delete_policy" ON public.careers FOR DELETE TO authenticated USING (auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin'));

-- ---------------------------------------------------------
-- Tabla: messages
-- Descripcion: Mensajes de contacto
-- Schema: public
-- Proyecto: LEARNMORE
-- ---------------------------------------------------------

CREATE TABLE public.messages (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  name text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  status text NULL DEFAULT 'nuevo'::text,
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT messages_pkey PRIMARY KEY (id)
)
TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_messages_status ON public.messages USING btree (status);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages USING btree (created_at DESC);

CREATE TRIGGER set_updated_at ON public.messages
  BEFORE UPDATE FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "messages_select_policy" ON public.messages FOR SELECT TO authenticated USING (auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin'));
CREATE POLICY "messages_insert_policy" ON public.messages FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "messages_update_policy" ON public.messages FOR UPDATE TO authenticated USING (auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin'));
CREATE POLICY "messages_delete_policy" ON public.messages FOR DELETE TO authenticated USING (auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin'));

-- ---------------------------------------------------------
-- Tabla: users
-- Descripcion: Usuarios del sistema
-- Schema: public
-- Proyecto: LEARNMORE
-- ---------------------------------------------------------

CREATE TABLE public.users (
  id text NOT NULL,
  email text NOT NULL,
  name text,
  role text NULL DEFAULT 'user'::text,
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT users_pkey PRIMARY KEY (id)
)
TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users USING btree (email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users USING btree (role);

CREATE TRIGGER set_updated_at ON public.users
  BEFORE UPDATE FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_select_policy" ON public.users FOR SELECT TO authenticated USING (auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin'));
CREATE POLICY "users_insert_policy" ON public.users FOR INSERT TO authenticated, anon WITH CHECK (true);
CREATE POLICY "users_update_policy" ON public.users FOR UPDATE TO authenticated USING (auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin')) WITH CHECK (auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin'));
CREATE POLICY "users_delete_policy" ON public.users FOR DELETE TO authenticated USING (auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin'));

-- ---------------------------------------------------------
-- Tabla: activity
-- Descripcion: Registro de actividad del sistema
-- Schema: public
-- Proyecto: LEARNMORE
-- ---------------------------------------------------------

CREATE TABLE public.activity (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  type text,
  text text,
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT activity_pkey PRIMARY KEY (id)
)
TABLESPACE pg_default;

CREATE TRIGGER set_updated_at ON public.activity
  BEFORE UPDATE FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

ALTER TABLE public.activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "activity_select_policy" ON public.activity FOR SELECT TO authenticated USING (auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin'));
CREATE POLICY "activity_insert_policy" ON public.activity FOR INSERT TO authenticated WITH CHECK (auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin'));