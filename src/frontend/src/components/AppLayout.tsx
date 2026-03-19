import { Button } from "@/components/ui/button";
import { APP_VERSION } from "@/config/appVersion";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { ClipboardList, History, LogOut } from "lucide-react";
import { SiCoffeescript } from "react-icons/si";
import { useRestaurantSession } from "../hooks/useRestaurantSession";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const router = useRouterState();
  const currentPath = router.location.pathname;
  const { session, logout } = useRestaurantSession();
  const navigate = useNavigate();

  // Login/admin pages: render minimal wrapper
  if (currentPath === "/login" || currentPath === "/admin") {
    return <>{children}</>;
  }

  const handleLogout = () => {
    logout();
    navigate({ to: "/login" });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                <ClipboardList className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  Shri Hoshnagi Enterprises
                </h1>
                {session ? (
                  <p className="text-sm text-muted-foreground">
                    {session.restaurantName}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Daily closing &amp; order tracker
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {session && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={handleLogout}
                  data-ocid="layout.logout.button"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              )}
              <div className="text-xs text-muted-foreground font-mono">
                v{APP_VERSION}
              </div>
            </div>
          </div>
          <nav className="flex flex-wrap gap-2">
            <Link to="/">
              <Button
                variant={currentPath === "/" ? "default" : "ghost"}
                size="sm"
                className="gap-2"
                data-ocid="nav.daily_entry.link"
              >
                <ClipboardList className="w-4 h-4" />
                Daily Entry
              </Button>
            </Link>
            <Link to="/history">
              <Button
                variant={
                  currentPath.startsWith("/history") ? "default" : "ghost"
                }
                size="sm"
                className="gap-2"
                data-ocid="nav.history.link"
              >
                <History className="w-4 h-4" />
                History
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6">{children}</main>

      <footer className="border-t border-border bg-card mt-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} Shri Hoshnagi Enterprises</p>
            <p className="flex items-center gap-1">
              Built with <SiCoffeescript className="w-4 h-4 text-chart-1" />{" "}
              using{" "}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                  typeof window !== "undefined"
                    ? window.location.hostname
                    : "restaurant-inventory",
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-foreground transition-colors"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
