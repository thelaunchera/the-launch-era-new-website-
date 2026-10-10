import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
  useRouterState,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { SiteHeader, SiteFooter } from "@/components/site-shell";
import { Analytics } from "@/components/analytics";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Cleaning Business Automation & Booking | The Launch Era" },
      { name: "description", content: "Booking automation, cleaning business management tools, AI assistants and follow-up systems for cleaning business owners across the U.S." },
      { name: "robots", content: "index, follow, max-image-preview:large" },
      { property: "og:site_name", content: "The Launch Era" },
      { property: "og:title", content: "THE LAUNCH ERA" },
      { property: "og:description", content: "Booking automation, AI assistants and cleaning business management tools for owners in the U.S." },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://raw.githubusercontent.com/thelaunchera/the-launch-era-new-website-/main/src/assets/cleaner-home.jpg" },
      { property: "og:image:alt", content: "The Launch Era systems for cleaning business owners" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "https://raw.githubusercontent.com/thelaunchera/the-launch-era-new-website-/main/src/assets/cleaner-home.jpg" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "stylesheet", href: "/assets/tle-mobile.css?v=20261009" },
      { rel: "stylesheet", href: "/assets/tle-sales.css?v=20261009-sales-3" },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;450;500;550;600;650;700&family=Libre+Caslon+Display&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  const pathname=useRouterState({select:(state)=>state.location.pathname});
  const language=pathname.startsWith("/es")?"es":"en";
  return (
    <html lang={language}>
      <head>
        <HeadContent />
        {/* Initialize the production GA4 queue before the app hydrates, so landing
            and checkout events are never discarded while the tag is loading. */}
        <script
          dangerouslySetInnerHTML={{ __html: `
(function () {
  var host = location.hostname.toLowerCase();
  if (host !== 'thelaunchera.com' && host !== 'www.thelaunchera.com' && host !== 'thelaunchera.github.io') return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  var script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.googletagmanager.com/gtag/js?id=G-N5BHMC432Q';
  script.setAttribute('data-tle-ga', '1');
  document.head.appendChild(script);
  window.gtag('js', new Date());
  window.gtag('config', 'G-N5BHMC432Q');
})();
` }}
        />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <Analytics />
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <SiteHeader />
      <Outlet />
      <SiteFooter />
    </QueryClientProvider>
  );
}
