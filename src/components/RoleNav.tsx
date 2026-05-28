import { Link, useRouterState } from "@tanstack/react-router";
import {
  Home, Map as MapIcon, Sparkles, Users, User,
  LayoutDashboard, Building2, Inbox, BarChart3,
  Hammer, MessageSquare, Wallet, KeyRound,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Item = { to: string; label: string; icon: React.ComponentType<{ className?: string; strokeWidth?: number }> };

const TENANT: Item[] = [
  { to: "/", label: "Browse", icon: Home },
  { to: "/map", label: "Map", icon: MapIcon },
  { to: "/assistant", label: "AI", icon: Sparkles },
  { to: "/community", label: "Community", icon: Users },
  { to: "/profile", label: "Profile", icon: User },
];

const LANDLORD: Item[] = [
  { to: "/landlord", label: "Portfolio", icon: LayoutDashboard },
  { to: "/landlord/listings", label: "Buildings", icon: Building2 },
  { to: "/landlord/inquiries", label: "Inquiries", icon: Inbox },
  { to: "/landlord/insights", label: "Insights", icon: BarChart3 },
  { to: "/profile", label: "Profile", icon: User },
];

const OWNER: Item[] = [
  { to: "/owner", label: "My Unit", icon: KeyRound },
  { to: "/owner/maintenance", label: "Fixes", icon: Hammer },
  { to: "/owner/messages", label: "Messages", icon: MessageSquare },
  { to: "/owner/finances", label: "Finances", icon: Wallet },
  { to: "/profile", label: "Profile", icon: User },
];

const ADMIN: Item[] = [
  { to: "/admin/role-requests", label: "Approvals", icon: ShieldCheck },
  { to: "/landlord", label: "Portfolio", icon: LayoutDashboard },
  { to: "/profile", label: "Profile", icon: User },
];

export type ShellKind = "tenant" | "landlord" | "owner" | "admin";

export function RoleNav({ shell }: { shell: ShellKind }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const items = shell === "landlord" ? LANDLORD : shell === "owner" ? OWNER : shell === "admin" ? ADMIN : TENANT;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 safe-bottom">
      <div className="mx-auto max-w-md px-3 pb-2 pt-1">
        <div className={cn(
          "shadow-card flex items-center justify-around rounded-3xl border border-border/60 px-1.5 py-2",
          shell === "tenant" || shell === "owner" ? "glass" : "bg-card/85 backdrop-blur",
        )}>
          {items.map(({ to, label, icon: Icon }) => {
            const active = pathname === to || (to !== "/" && pathname.startsWith(to));
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  "flex flex-1 flex-col items-center gap-0.5 rounded-2xl py-1.5 text-[10px] font-medium transition-all",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <div className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-xl transition-all",
                  active && "gradient-primary text-primary-foreground shadow-elegant",
                )}>
                  <Icon className="h-[17px] w-[17px]" strokeWidth={2.4} />
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

/** Pick which nav/theme to apply based on the current URL prefix. */
export function shellForPath(pathname: string): ShellKind | null {
  if (pathname.startsWith("/property/") || pathname.startsWith("/auth") || pathname.startsWith("/onboarding")) return null;
  if (pathname.startsWith("/admin")) return "admin";
  if (pathname.startsWith("/landlord")) return "landlord";
  if (pathname.startsWith("/owner")) return "owner";
  return "tenant";
}
