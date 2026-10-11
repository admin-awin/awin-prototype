import { Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { ScrollToTop } from "./ScrollToTop";
import { useAuth } from "@/lib/use-auth";

// Routes a user must still be able to reach even while a password change is
// pending — the change-password page itself, and sign-out/auth.
const FORCE_CHANGE_ALLOWLIST = ["/change-password", "/auth"];

function ForcePasswordChangeGate() {
  const { user, loading, forcePasswordChange } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading || !user || !forcePasswordChange) return;
    if (FORCE_CHANGE_ALLOWLIST.includes(location.pathname)) return;
    // Remember where they were headed so /change-password can return them
    // there afterward, instead of always landing on a generic admin/portal home.
    navigate({ to: "/change-password", search: { next: location.pathname }, replace: true });
  }, [loading, user, forcePasswordChange, location.pathname, navigate]);

  return null;
}

export function SiteLayout() {
  const location = useLocation();
  // ThuthukaSA's dashboard is deliberately not "the A-Win site" — no A-Win
  // nav, no A-Win footer, so it never reads as just another page of the
  // member site. It builds its own header/chrome entirely.
  const bareLayout = location.pathname === "/tksa";
  // ThuthukaSA's client-facing LOA/RPA forms: ThuthukaSA chrome only.
  const thuthukaLayout = location.pathname === "/loa" || location.pathname === "/loa-rpa";

  if (bareLayout) {
    return (
      <>
        <ForcePasswordChangeGate />
        <Outlet />
        <ScrollToTop />
      </>
    );
  }

  if (thuthukaLayout) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <header className="border-b border-border bg-card">
          <div className="container mx-auto flex items-center gap-3 px-4 py-3">
            <img src="/email-assets/thuthuka-logo.png" alt="ThuthukaSA" className="h-10 w-auto" />
            <span className="font-serif text-lg text-foreground">ThuthukaSA</span>
          </div>
        </header>
        <main className="flex-1">
          <Outlet />
        </main>
        <footer className="border-t border-border bg-card py-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} ThuthukaSA · Authorised Financial Services Provider (FSP No. 47992)
        </footer>
        <ScrollToTop />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <ForcePasswordChangeGate />
      <SiteHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <SiteFooter />
      <ScrollToTop />
    </div>
  );
}
