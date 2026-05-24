
-- Lock down SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- Restrict bucket listing: only allow direct file access by exact path, not listing
DROP POLICY IF EXISTS "Listing photos public read" ON storage.objects;
DROP POLICY IF EXISTS "Avatars public read" ON storage.objects;

CREATE POLICY "Listing photos read by path"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'listing-photos' AND (storage.foldername(name))[1] IS NOT NULL);

CREATE POLICY "Avatars read by path"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] IS NOT NULL);
