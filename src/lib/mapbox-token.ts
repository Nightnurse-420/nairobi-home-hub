const KEY = "ns:mapbox-token";

export function getMapboxToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(KEY);
}

export function setMapboxToken(token: string) {
  localStorage.setItem(KEY, token.trim());
  window.dispatchEvent(new Event("ns:mapbox-token-changed"));
}
