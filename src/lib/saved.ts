import { useEffect, useState, useCallback } from "react";

const KEY = "ns:saved";

function read(): string[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
}
function write(ids: string[]) {
  localStorage.setItem(KEY, JSON.stringify(ids));
  window.dispatchEvent(new Event("ns:saved-changed"));
}

export function useSaved() {
  const [ids, setIds] = useState<string[]>([]);
  useEffect(() => {
    setIds(read());
    const sync = () => setIds(read());
    window.addEventListener("ns:saved-changed", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("ns:saved-changed", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  const toggle = useCallback((id: string) => {
    const cur = read();
    const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
    write(next);
  }, []);
  const isSaved = useCallback((id: string) => ids.includes(id), [ids]);
  return { ids, toggle, isSaved };
}
