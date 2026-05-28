
DROP POLICY IF EXISTS "Users insert own role" ON public.user_roles;
CREATE POLICY "Users self-claim tenant role"
  ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND role = 'tenant'::app_role);
