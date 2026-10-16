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
      { rel: "stylesheet", href: "/assets/tle-editorial-refresh.css?v=20261012-wave-clear-1" },
      { rel: "icon", href: "/favicon-tle.svg?v=20261014", type: "image/svg+xml", sizes: "any" },
      { rel: "icon", href: "/favicon.ico", sizes: "16x16 32x32 48x48 64x64" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png", sizes: "180x180" },
      { rel: "stylesheet", href: "/assets/tle-brand.css?v=20261012" },
      { rel: "stylesheet", href: "/assets/tle-saas-ui-v1.css?v=20261013-1" },
      { rel: "stylesheet", href: "/assets/tle-hero-scroll.css?v=20261016-inner-blue-mesh2" },
      { rel: "stylesheet", href: "/assets/tle-marketing-cta-motion.css?v=20261016-quiet4" },
      { rel: "stylesheet", href: "/assets/tle-pricing-motion.css?v=20261016-2" },
      { rel: "stylesheet", href: "/assets/tle-services-color-shift.css?v=20261016-contrast2" },
      { rel: "stylesheet", href: "/assets/tle-booking-tones.css?v=20261016-1" },
      { rel: "stylesheet", href: "/assets/tle-purchase-proof.css?v=20261016-mini3" },
      { rel: "stylesheet", href: "/assets/tle-footer-newsletter.css?v=20261016-ios2" },
      { rel: "stylesheet", href: "/assets/tle-footer-theme-sweep.css?v=20261016-4" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;450;500;550;600;650;700&family=Prompt:wght@400;500;600;700&display=swap" },
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
        {/* Handle legacy recovery callbacks before analytics or the public website loads. */}
        <script
          dangerouslySetInnerHTML={{ __html: `
(function () {
  if (location.pathname !== '/') return;
  var fragment = new URLSearchParams(location.hash.slice(1));
  var query = new URLSearchParams(location.search);
  var tokenRecovery = fragment.get('type') === 'recovery' && fragment.has('access_token');
  var codeRecovery = query.has('code') && query.get('app') === 'tle';
  if (!tokenRecovery && !codeRecovery) return;
  location.replace('/auth-recovery.html' + (codeRecovery ? '?code=' + encodeURIComponent(query.get('code')) : '') + location.hash);
})();
` }}
        />
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
        {/* DOM-enhancing scripts load after React hydration (RootComponent effect). */}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  // Give nested SSR boundaries time to hydrate before marketing DOM enhancement.
  // No changes to the existing assistant, verified purchase or newsletter logic.
  useEffect(() => {
    const sources = [
      '/assets/jessy-site.js?v=20261016-compact-checkout-v2',
      '/assets/tle-purchase-proof.js?v=20261016-mini3',
      '/assets/tle-footer-newsletter.js?v=20261016-ios3',
    ];
    const added: HTMLScriptElement[] = [];
    const timer = window.setTimeout(() => {
      for (const src of sources) {
        if (document.querySelector('script[data-tle-after-hydration][src="' + src + '"]')) continue;
        const script = document.createElement('script');
        script.src = src;
        script.async = false;
        script.dataset.tleAfterHydration = 'true';
        document.body.appendChild(script);
        added.push(script);
      }
    }, 1200);
    return () => {
      window.clearTimeout(timer);
      added.forEach((script) => script.remove());
    };
  }, []);
  // Load DOM-enhancing services motion only after React has hydrated the SSR
  // homepage. Injecting a script before hydration caused React error #418.
  useEffect(() => {
    let element: HTMLScriptElement | null = null;
    const timer = window.setTimeout(() => {
      element = document.createElement('script');
      element.src = '/assets/tle-services-color-shift.js?v=20261016-v4';
      element.async = true;
      element.setAttribute('data-tle-service-motion', '1');
      document.body.appendChild(element);
    }, 1850);
    return () => { window.clearTimeout(timer); element?.remove(); };
  }, []);

  // Public pricing enhancements mount only after React hydration; this must
  // never run inside the checkout, demo or private Command Center.
  useEffect(() => {
    const blockedPricingPaths=['/booking-demo/','/cleaning-app-demo/','/lead-private-preview','/command-center/','/service-checkout/'];
    if (blockedPricingPaths.some(path=>window.location.pathname.startsWith(path))) return;
    let script: HTMLScriptElement | null = null;
    const timer = window.setTimeout(() => {
      script=document.createElement('script');
      script.src='/assets/tle-pricing-motion.js?v=20261016-1';
      script.async=true;
      script.setAttribute('data-tle-pricing-motion','1');
      document.body.appendChild(script);
    }, 1850);
    return ()=>{window.clearTimeout(timer);script?.remove();};
  }, []);

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
