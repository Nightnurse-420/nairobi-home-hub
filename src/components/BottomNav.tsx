import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Map as MapIcon, Heart, User } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/", label: "Home", icon: Home },
  { to: "/map", label: "Map", icon: MapIcon },
  { to: "/saved", label: "Saved", icon: Heart },
  { to: "/profile", label: "Profile", icon: User },
] as const;

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 safe-bottom">
      <div className="mx-auto max-w-md px-3 pb-2 pt-1">
        <div className="glass shadow-card flex items-center justify-around rounded-3xl border border-border/60 px-2 py-2">
          {items.map(({ to, label, icon: Icon }) => {
            const active = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  "flex flex-1 flex-col items-center gap-0.5 rounded-2xl py-2 text-[11px] font-medium transition-all",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <div className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-xl transition-all",
                  active && "gradient-primary text-primary-foreground shadow-elegant",
                )}>
                  <Icon className="h-[18px] w-[18px]" strokeWidth={2.4} />
                </div>
                <span>{label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
