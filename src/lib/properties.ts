import apt1 from "@/assets/apt-1.jpg";
import apt2 from "@/assets/apt-2.jpg";
import apt3 from "@/assets/apt-3.jpg";
import apt4 from "@/assets/apt-4.jpg";
import apt5 from "@/assets/apt-5.jpg";
import apt6 from "@/assets/apt-6.jpg";

export type PropertyType = "Bedsitter" | "Studio" | "1BR" | "2BR" | "3BR" | "Penthouse";

export interface Property {
  id: string;
  title: string;
  neighborhood: string;
  type: PropertyType;
  rent: number; // KES/month
  beds: number;
  baths: number;
  sqm: number;
  lng: number;
  lat: number;
  images: string[];
  amenities: string[];
  rating: number;
  reviews: number;
  verified: "today" | "week" | "month";
  premium?: boolean;
  noAgentFee?: boolean;
  scores: { water: number; security: number; internet: number; power: number };
  landlord: { name: string; phone: string; trusted: boolean };
  description: string;
  vacant: boolean;
  postedDays: number;
}

const A = [apt1, apt2, apt3, apt4, apt5, apt6];

export const NEIGHBORHOODS = [
  "Kilimani", "Westlands", "Lavington", "Kileleshwa", "Karen", "Parklands",
  "South B", "South C", "Ngong Road", "Rongai", "Ruaka", "Roysambu",
  "Donholm", "Embakasi", "Thindigua",
];

export const PROPERTIES: Property[] = [
  {
    id: "p1", title: "Sunlit 2BR with Balcony", neighborhood: "Kilimani", type: "2BR",
    rent: 65000, beds: 2, baths: 2, sqm: 95, lng: 36.7848, lat: -1.2921,
    images: [A[0], A[5], A[2]], amenities: ["Borehole", "Backup Generator", "Parking", "CCTV", "Lift", "Gym"],
    rating: 4.8, reviews: 42, verified: "today", premium: true, noAgentFee: true,
    scores: { water: 92, security: 88, internet: 95, power: 90 },
    landlord: { name: "Wanjiru K.", phone: "+254712345678", trusted: true },
    description: "Newly renovated 2-bedroom unit in a quiet gated block. All-day water from a private borehole, fiber-ready, and within walking distance to Yaya Centre and Adams Arcade.",
    vacant: true, postedDays: 2,
  },
  {
    id: "p2", title: "Modern Studio, City Views", neighborhood: "Westlands", type: "Studio",
    rent: 38000, beds: 1, baths: 1, sqm: 38, lng: 36.8108, lat: -1.2676,
    images: [A[1], A[5]], amenities: ["WiFi Included", "Furnished", "Lift", "CCTV", "Rooftop"],
    rating: 4.6, reviews: 28, verified: "today", noAgentFee: true,
    scores: { water: 85, security: 92, internet: 98, power: 88 },
    landlord: { name: "Brian Otieno", phone: "+254722345001", trusted: true },
    description: "Fully furnished studio perfect for young professionals. Walk to Sarit Centre, Westgate and the Nairobi Expressway.",
    vacant: true, postedDays: 1,
  },
  {
    id: "p3", title: "Family 3BR in Gated Estate", neighborhood: "Lavington", type: "3BR",
    rent: 145000, beds: 3, baths: 3, sqm: 180, lng: 36.7681, lat: -1.2807,
    images: [A[2], A[0], A[5]], amenities: ["Borehole", "Pool", "Gym", "Backup Generator", "Pet Friendly", "Garden", "Parking", "CCTV"],
    rating: 4.9, reviews: 19, verified: "today", premium: true,
    scores: { water: 98, security: 96, internet: 92, power: 95 },
    landlord: { name: "Lavington Heights Ltd", phone: "+254733000111", trusted: true },
    description: "Spacious family home in a serene gated community. Marble countertops, en-suite master, large balcony with garden views.",
    vacant: true, postedDays: 4,
  },
  {
    id: "p4", title: "Affordable Bedsitter", neighborhood: "Rongai", type: "Bedsitter",
    rent: 9500, beds: 1, baths: 1, sqm: 22, lng: 36.7466, lat: -1.3947,
    images: [A[3]], amenities: ["Water Tank", "Parking", "Security"],
    rating: 4.1, reviews: 56, verified: "week", noAgentFee: true,
    scores: { water: 72, security: 78, internet: 70, power: 82 },
    landlord: { name: "Joseph Mwangi", phone: "+254700111222", trusted: true },
    description: "Compact, clean bedsitter near Rongai town. Matatu stage 2 minutes away. Student-friendly.",
    vacant: true, postedDays: 5,
  },
  {
    id: "p5", title: "Penthouse with Infinity Pool", neighborhood: "Lavington", type: "Penthouse",
    rent: 320000, beds: 4, baths: 4, sqm: 280, lng: 36.7752, lat: -1.2845,
    images: [A[4], A[2], A[5]], amenities: ["Pool", "Gym", "Concierge", "Backup Generator", "Borehole", "Parking", "Smart Home", "Rooftop"],
    rating: 5.0, reviews: 8, verified: "today", premium: true, noAgentFee: true,
    scores: { water: 100, security: 99, internet: 99, power: 100 },
    landlord: { name: "Skyline Living", phone: "+254799000999", trusted: true },
    description: "Top-floor luxury penthouse with private rooftop terrace and infinity pool overlooking Nairobi skyline.",
    vacant: true, postedDays: 1,
  },
  {
    id: "p6", title: "Cozy 1BR Near CBD", neighborhood: "South B", type: "1BR",
    rent: 22000, beds: 1, baths: 1, sqm: 48, lng: 36.8395, lat: -1.3134,
    images: [A[1], A[3]], amenities: ["Borehole", "Parking", "CCTV"],
    rating: 4.3, reviews: 31, verified: "week",
    scores: { water: 80, security: 75, internet: 78, power: 80 },
    landlord: { name: "Faith Achieng", phone: "+254711000333", trusted: false },
    description: "Bright one-bedroom 10 minutes from CBD. Reliable water and ample parking.",
    vacant: true, postedDays: 7,
  },
  {
    id: "p7", title: "Spacious 2BR in Kileleshwa", neighborhood: "Kileleshwa", type: "2BR",
    rent: 78000, beds: 2, baths: 2, sqm: 110, lng: 36.7831, lat: -1.2763,
    images: [A[0], A[2]], amenities: ["Borehole", "Lift", "Gym", "Parking", "CCTV", "Backup Generator"],
    rating: 4.7, reviews: 24, verified: "today", noAgentFee: true,
    scores: { water: 94, security: 90, internet: 90, power: 92 },
    landlord: { name: "Green Court Mgmt", phone: "+254700888777", trusted: true },
    description: "Modern apartment in tree-lined Kileleshwa. Quiet street, secure compound, ready for move-in.",
    vacant: true, postedDays: 3,
  },
  {
    id: "p8", title: "Garden Studio in Karen", neighborhood: "Karen", type: "Studio",
    rent: 45000, beds: 1, baths: 1, sqm: 42, lng: 36.7066, lat: -1.3194,
    images: [A[1], A[5]], amenities: ["Garden", "Pet Friendly", "Parking", "Borehole"],
    rating: 4.5, reviews: 14, verified: "week",
    scores: { water: 88, security: 85, internet: 80, power: 85 },
    landlord: { name: "Karen Cottages", phone: "+254722999888", trusted: true },
    description: "Charming standalone studio in leafy Karen. Private garden entrance, dog-friendly.",
    vacant: true, postedDays: 6,
  },
  {
    id: "p9", title: "Student 1BR Near USIU", neighborhood: "Roysambu", type: "1BR",
    rent: 16500, beds: 1, baths: 1, sqm: 40, lng: 36.8881, lat: -1.2199,
    images: [A[3], A[1]], amenities: ["WiFi Included", "Water Tank", "CCTV"],
    rating: 4.2, reviews: 67, verified: "week", noAgentFee: true,
    scores: { water: 75, security: 78, internet: 90, power: 80 },
    landlord: { name: "Campus Stay", phone: "+254701222111", trusted: true },
    description: "Affordable one-bedroom designed for students. Walking distance to USIU and Kasarani.",
    vacant: true, postedDays: 2,
  },
  {
    id: "p10", title: "Executive 3BR Apartment", neighborhood: "Parklands", type: "3BR",
    rent: 110000, beds: 3, baths: 3, sqm: 160, lng: 36.8226, lat: -1.2615,
    images: [A[2], A[5], A[0]], amenities: ["Pool", "Gym", "Borehole", "Backup Generator", "Lift", "Parking", "CCTV"],
    rating: 4.7, reviews: 16, verified: "today", premium: true,
    scores: { water: 93, security: 91, internet: 94, power: 93 },
    landlord: { name: "Aga Khan Walk Mgmt", phone: "+254700456789", trusted: true },
    description: "High-floor 3-bedroom with all amenities. Close to Aga Khan Hospital and Westlands.",
    vacant: true, postedDays: 1,
  },
  {
    id: "p11", title: "Bright 2BR in Ngong Road", neighborhood: "Ngong Road", type: "2BR",
    rent: 52000, beds: 2, baths: 2, sqm: 88, lng: 36.7592, lat: -1.3000,
    images: [A[0], A[3]], amenities: ["Borehole", "Parking", "CCTV", "Lift"],
    rating: 4.4, reviews: 22, verified: "week", noAgentFee: true,
    scores: { water: 86, security: 84, internet: 86, power: 88 },
    landlord: { name: "Prestige Homes", phone: "+254712789000", trusted: true },
    description: "Bright 2-bedroom along Ngong Road. Easy access to Junction Mall and Yaya.",
    vacant: true, postedDays: 4,
  },
  {
    id: "p12", title: "Modern Bedsitter in Ruaka", neighborhood: "Ruaka", type: "Bedsitter",
    rent: 12000, beds: 1, baths: 1, sqm: 26, lng: 36.7659, lat: -1.2099,
    images: [A[3], A[1]], amenities: ["Borehole", "CCTV", "Parking"],
    rating: 4.0, reviews: 38, verified: "month", noAgentFee: true,
    scores: { water: 70, security: 80, internet: 75, power: 82 },
    landlord: { name: "Ruaka Plaza", phone: "+254710000555", trusted: false },
    description: "New bedsitter block close to Ruaka mall. Great value for money.",
    vacant: true, postedDays: 9,
  },
];

export const AMENITY_FILTERS = [
  "Furnished", "WiFi Included", "Parking", "Borehole", "Pet Friendly",
  "Gated", "CCTV", "Backup Generator", "Pool", "Gym", "Lift",
  "Rooftop", "Garden", "Smart Home",
];

export function formatKES(amount: number) {
  return "KES " + amount.toLocaleString("en-KE");
}

export function getProperty(id: string) {
  return PROPERTIES.find((p) => p.id === id);
}
