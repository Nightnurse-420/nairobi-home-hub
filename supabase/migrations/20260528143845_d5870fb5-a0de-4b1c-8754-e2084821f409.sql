ALTER TABLE public.listings REPLICA IDENTITY FULL;
ALTER TABLE public.listing_images REPLICA IDENTITY FULL;
DO $$ BEGIN
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.listings; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.listing_images; EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;