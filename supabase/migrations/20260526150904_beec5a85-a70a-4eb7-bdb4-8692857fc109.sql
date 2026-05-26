
GRANT SELECT ON public.listings TO anon;
GRANT SELECT ON public.listing_images TO anon;

DROP POLICY IF EXISTS "Published listings public read" ON public.listings;
CREATE POLICY "Published listings public read" ON public.listings
  FOR SELECT TO anon, authenticated
  USING (published = true OR auth.uid() = owner_id);

DROP POLICY IF EXISTS "Owners and admins read all listings" ON public.listings;
CREATE POLICY "Admins read all listings" ON public.listings
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));
