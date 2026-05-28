
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS unit_number TEXT;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS building_name TEXT;

CREATE TABLE IF NOT EXISTS public.role_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  requested_role app_role NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  note TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT role_requests_status_chk CHECK (status IN ('pending','approved','denied')),
  CONSTRAINT role_requests_role_chk CHECK (requested_role IN ('landlord','apartment_owner'))
);

CREATE INDEX IF NOT EXISTS idx_role_requests_user ON public.role_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_role_requests_status ON public.role_requests(status);

GRANT SELECT, INSERT, UPDATE ON public.role_requests TO authenticated;
GRANT ALL ON public.role_requests TO service_role;

ALTER TABLE public.role_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own role requests"
  ON public.role_requests FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Users create own role requests"
  ON public.role_requests FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Admins update role requests"
  ON public.role_requests FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_role_requests_updated
  BEFORE UPDATE ON public.role_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.apply_role_request()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'approved' AND (OLD.status IS DISTINCT FROM 'approved') THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.user_id, NEW.requested_role)
    ON CONFLICT (user_id, role) DO NOTHING;
    NEW.reviewed_at := now();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_role_requests_apply
  BEFORE UPDATE ON public.role_requests
  FOR EACH ROW EXECUTE FUNCTION public.apply_role_request();

DROP POLICY IF EXISTS "Landlords create listings" ON public.listings;
CREATE POLICY "Landlords or owners create listings"
  ON public.listings FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = owner_id
    AND (has_role(auth.uid(), 'landlord') OR has_role(auth.uid(), 'apartment_owner'))
  );
