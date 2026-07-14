-- ---------------------------------------------------------
-- Función: handle_updated_at
-- Descripcion: Función trigger para actualizar automáticamente updated_at
-- Schema: public
-- Proyecto: LEARNMORE
-- ---------------------------------------------------------

-- Función que actualiza el campo updated_at con la fecha actual
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- También creamos una función para incrementar vistas sin RLS bloque
CREATE OR REPLACE FUNCTION public.increment_guide_views(view_guide_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE public.guides 
  SET views = views + 1 
  WHERE id = view_guide_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Permite a usuarios anónimos incrementar vistas vía RPC
GRANT EXECUTE ON FUNCTION public.increment_guide_views(uuid) TO anon;