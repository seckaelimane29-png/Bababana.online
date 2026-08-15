import { createFileRoute, Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Home, BookOpen, Sparkles, User } from "lucide-react";
import { useProfile } from "@/lib/profile";
import { t } from "@/lib/i18n";
import { SubscriptionBanner } from "@/components/SubscriptionBanner";

export const Route = createFileRoute("/app")({
  component: AppLayout,
});

function AppLayout() {
  const nav = useNavigate();
  const { profile, ready } = useProfile();
  const loc = useLocation();

  useEffect(() => {
    if (ready && !profile.onboarded) nav({ to: "/onboarding" });
  }, [ready, profile.onboarded, nav]);

  const tabs = [
    { to: "/app" as const, label: t(profile.language, "nav.home"), icon: Home },
    { to: "/app/books" as const, label: t(profile.language, "nav.books"), icon: BookOpen },
    { to: "/app/wisdom" as const, label: t(profile.language, "nav.wisdom"), icon: Sparkles },
    { to: "/app/profile" as const, label: t(profile.language, "nav.profile"), icon: User },
  ];

  return (
    <div className="min-h-screen bg-background pb-20 text-foreground">
      <main className="mx-auto max-w-md">
        <SubscriptionBanner />
        <Outlet />
      </main>
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur">
        <div className="mx-auto grid max-w-md grid-cols-4">
          {tabs.map((tab) => {
            const active = loc.pathname === tab.to || (tab.to !== "/app" && loc.pathname.startsWith(tab.to));
            const Icon = tab.icon;
            return (
              <Link key={tab.to} to={tab.to} className={`flex flex-col items-center gap-1 py-3 text-[11px] transition ${active ? "text-primary" : "text-muted-foreground"}`}>
                <Icon className={`h-5 w-5 ${active ? "text-primary" : ""}`} />
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}