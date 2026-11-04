/*
# Quitar cambio de rol de demostración y asignar lector por defecto

1. Elimina demo_set_profile: permitía a cualquier usuario autenticado cambiarse a creador y a socio.
2. Los nuevos registros son siempre lector, sin importar el dominio del correo.
3. Enviar propuestas exige el rol colaborador (antes, creador).
Sin pérdida de datos: no se modifican filas existentes.
*/

DROP FUNCTION IF EXISTS public.demo_set_profile(text, boolean);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'lector')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

DROP POLICY IF EXISTS "submissions_insert_own" ON public.submissions;
CREATE POLICY "submissions_insert_own" ON public.submissions FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT auth.uid()) = user_id
    AND status = 'pendiente'
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = (SELECT auth.uid()) AND p.role = 'colaborador'
    )
  );
