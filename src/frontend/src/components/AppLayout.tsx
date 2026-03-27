import { Button } from "@/components/ui/button";
import { APP_VERSION } from "@/config/appVersion";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { SiCoffeescript } from "react-icons/si";
import { useRestaurantSession } from "../hooks/useRestaurantSession";
import BottomNavBar from "./BottomNavBar";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const router = useRouterState();
  const currentPath = router.location.pathname;
  const { session, logout } = useRestaurantSession();
  const navigate = useNavigate();

  if (currentPath === "/login" || currentPath === "/admin") {
    return <>{children}</>;
  }

  const handleLogout = () => {
    logout();
    navigate({ to: "/login" });
  };

  const showBottomNav = !!session;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header
        className="border-b sticky top-0 z-40"
        style={{
          background: "#FFF0E0",
          borderColor: "#E07820",
          boxShadow: "0 1px 4px rgba(224,120,32,0.15)",
        }}
      >
        <div className="px-3 py-2 flex items-center justify-between">
          {/* Left: Logo + Name */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md overflow-hidden flex-shrink-0">
              <img
                src="/assets/uploads/logo-app-draft-2.jpg"
                alt="Shri Hoshnagi F&B Opp."
                className="w-full h-full object-cover"
                onError={(e) => {
                  const el = e.target as HTMLImageElement;
                  el.style.display = "none";
                  el.parentElement!.style.background = "#E07820";
                }}
              />
            </div>
            <div>
              <div
                className="text-sm font-bold leading-tight"
                style={{ color: "#7A3A00" }}
              >
                Shri Hoshnagi F&amp;B Opp.
              </div>
              {session && (
                <div
                  className="text-xs leading-tight"
                  style={{ color: "#B05A10" }}
                >
                  {session.restaurantName}
                </div>
              )}
            </div>
          </div>

          {/* Right: version, logout */}
          <div className="flex items-center gap-1">
            <span
              className="text-xs font-mono mr-1"
              style={{ color: "#B05A10" }}
            >
              v{APP_VERSION}
            </span>

            {session && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:text-destructive"
                style={{ color: "#E07820" }}
                onClick={handleLogout}
                data-ocid="layout.logout.button"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </header>

      <main
        className="flex-1 container mx-auto px-3 py-4"
        style={{ paddingBottom: showBottomNav ? 76 : 24 }}
      >
        {children}
      </main>

      {!showBottomNav && (
        <footer className="border-t border-border bg-card mt-auto">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
              <p>
                &copy; {new Date().getFullYear()} Shri Hoshnagi F&amp;B Opp.
              </p>
              <p className="flex items-center gap-1">
                Built with <SiCoffeescript className="w-3 h-3 text-chart-1" />{" "}
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
      )}

      {showBottomNav && <BottomNavBar />}
    </div>
  );
}
