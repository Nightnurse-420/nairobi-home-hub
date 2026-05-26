import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PROPERTIES, type Property, type PropertyType } from "@/lib/properties";
import fallbackImg from "@/assets/apt-1.jpg";

const VALID_TYPES: PropertyType[] = ["Bedsitter", "Studio", "1BR", "2BR", "3BR", "Penthouse"];

export function mapDbListing(row: any): Property {
  const images: string[] = (row.listing_images ?? [])
    .slice()
    .sort((a: any, b: any) => (a.position ?? 0) - (b.position ?? 0))
    .map((i: any) => i.url)
    .filter(Boolean);

  const type = (VALID_TYPES.includes(row.property_type) ? row.property_type : "1BR") as PropertyType;
  const createdAt = row.created_at ? new Date(row.created_at).getTime() : Date.now();
  const postedDays = Math.max(0, Math.floor((Date.now() - createdAt) / 86400000));

  return {
    id: row.id,
    title: row.title ?? "Untitled listing",
    neighborhood: row.neighborhood ?? "Nairobi",
    type,
    rent: row.rent ?? 0,
    beds: row.beds ?? 1,
    baths: row.baths ?? 1,
    sqm: row.sqm ?? 0,
    lng: row.lng ?? 0,
    lat: row.lat ?? 0,
    images: images.length ? images : [fallbackImg],
    amenities: row.amenities ?? [],
    rating: 0,
    reviews: 0,
    verified: row.verified ? "today" : "week",
    noAgentFee: row.no_agent_fee,
    scores: { water: 80, security: 80, internet: 80, power: 80 },
    landlord: { name: "Verified landlord", phone: row.whatsapp ?? "", trusted: !!row.verified },
    description: row.description ?? "",
    vacant: row.vacant ?? true,
    postedDays,
  };
}

async function fetchDbListings(): Promise<Property[]> {
  const { data, error } = await supabase
    .from("listings")
    .select("*, listing_images(url, position)")
    .eq("published", true)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapDbListing);
}

export function useAllProperties() {
  const q = useQuery({
    queryKey: ["listings", "public"],
    queryFn: fetchDbListings,
    staleTime: 60_000,
  });
  const db = q.data ?? [];
  return { properties: [...db, ...PROPERTIES], dbCount: db.length, isLoading: q.isLoading };
}

export async function fetchListingById(id: string): Promise<Property | null> {
  const { data, error } = await supabase
    .from("listings")
    .select("*, listing_images(url, position)")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  return mapDbListing(data);
}
