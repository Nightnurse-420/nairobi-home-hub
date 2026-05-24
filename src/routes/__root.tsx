import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet, Link, createRootRouteWithContext, useRouter,
  HeadContent, Scripts, useRouterState,
} from "@tanstack/react-router";
import appCss from "../styles.css?url";
import { BottomNav } from "@/components/BottomNav";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl font-bold text-foreground">404</h1>
        <p className="mt-3 text-muted-foreground">This page doesn't exist.</p>
        <Link to="/" className="mt-6 inline-flex rounded-2xl gradient-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-elegant">
          Back to home
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-xl font-bold">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">Try again in a moment.</p>
        <button onClick={() => { router.invalidate(); reset(); }} className="mt-5 rounded-2xl gradient-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">
          Try again
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#10B981" },
      { title: "NyumbaSearch — Find Verified Homes Smarter" },
      { name: "description", content: "Discover verified vacant houses in Nairobi without agents. Live vacancy data, neighborhood intelligence, and trusted landlords." },
      { property: "og:title", content: "NyumbaSearch — Find Verified Homes Smarter" },
      { property: "og:description", content: "AI-powered house hunting for Nairobi. Real listings, real scores, real landlords." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  // Hide bottom nav on full-screen views (property detail uses its own back button but keep nav for browse)
  const hideNav = pathname.startsWith("/property/");
  return (
    <QueryClientProvider client={queryClient}>
      <div className="mx-auto min-h-screen max-w-md bg-background">
        <Outlet />
        {!hideNav && <div className="h-24" />}
        {!hideNav && <BottomNav />}
      </div>
    </QueryClientProvider>
  );
}
