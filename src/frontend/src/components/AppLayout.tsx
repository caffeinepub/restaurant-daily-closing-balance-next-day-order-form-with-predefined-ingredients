import { Button } from "@/components/ui/button";
import { APP_VERSION } from "@/config/appVersion";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { ChevronDown, Home, LogOut } from "lucide-react";
import { useRef, useState } from "react";
import { SiCoffeescript } from "react-icons/si";
import { useRestaurantSession } from "../hooks/useRestaurantSession";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const router = useRouterState();
  const currentPath = router.location.pathname;
  const { session, logout, switchRestaurant } = useRestaurantSession();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  if (
    currentPath === "/login" ||
    currentPath === "/admin" ||
    currentPath === "/"
  ) {
    return <>{children}</>;
  }

  const handleLogout = () => {
    logout();
    navigate({ to: "/login" });
  };

  const isMultiRestaurant =
    session?.availableRestaurants && session.availableRestaurants.length > 1;

  // Show home button bar on all authenticated non-home pages
  const showHomeBar = !!session;

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
        {/* Top row: Logo + App Name + Tagline + version + logout */}
        <div className="px-3 pt-2 pb-1 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="rounded-lg overflow-hidden flex-shrink-0 shadow-sm"
              style={{ width: 52, height: 52 }}
            >
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
                className="font-bold leading-tight"
                style={{ color: "#7A3A00", fontSize: "15px" }}
              >
                Shri Hoshnagi F&amp;B Opp.
              </div>
              <div
                className="leading-tight"
                style={{ color: "#B05A10", fontSize: "10px" }}
              >
                F &amp; B Control &amp; SOP Management
              </div>
            </div>
          </div>

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

        {/* Restaurant name row */}
        {session && (
          <div
            className="px-3 pb-2"
            style={{ borderTop: "1px solid rgba(224,120,32,0.2)" }}
          >
            {isMultiRestaurant ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  className="flex items-center gap-1.5"
                  style={{
                    background: "transparent",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                  }}
                  onClick={() => setShowDropdown((v) => !v)}
                  data-ocid="layout.restaurant.dropdown"
                >
                  <span
                    className="font-bold leading-tight"
                    style={{ color: "#7A3A00", fontSize: "22px" }}
                  >
                    {session.restaurantName}
                  </span>
                  <ChevronDown
                    style={{
                      width: 22,
                      height: 22,
                      color: "#E07820",
                      flexShrink: 0,
                      transform: showDropdown
                        ? "rotate(180deg)"
                        : "rotate(0deg)",
                      transition: "transform 0.2s",
                    }}
                  />
                </button>
                {showDropdown && (
                  <div
                    className="absolute left-0 top-full mt-1 z-50 rounded-lg shadow-lg border overflow-hidden"
                    style={{
                      background: "#FFF8F0",
                      borderColor: "#E07820",
                      minWidth: "200px",
                    }}
                  >
                    {session.availableRestaurants.map((r) => (
                      <button
                        type="button"
                        key={r}
                        className="w-full text-left px-4 py-3 font-semibold"
                        style={{
                          background:
                            r === session.restaurantName
                              ? "#FFE0B0"
                              : "transparent",
                          color: "#7A3A00",
                          fontSize: "16px",
                          borderBottom: "1px solid rgba(224,120,32,0.15)",
                          cursor: "pointer",
                        }}
                        onClick={() => {
                          switchRestaurant(r);
                          setShowDropdown(false);
                        }}
                        data-ocid="layout.restaurant.option"
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <span
                className="font-bold leading-tight block"
                style={{ color: "#7A3A00", fontSize: "22px" }}
              >
                {session.restaurantName}
              </span>
            )}
          </div>
        )}
      </header>

      <main
        className="flex-1 container mx-auto px-3 py-4"
        style={{ paddingBottom: showHomeBar ? 72 : 24 }}
      >
        {children}
      </main>

      {!showHomeBar && (
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

      {/* Home button bar — shown on all authenticated non-home pages */}
      {showHomeBar && (
        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 50,
            background: "white",
            borderTop: "1.5px solid #E07820",
            display: "flex",
            justifyContent: "center",
            padding: "8px 16px",
          }}
        >
          <button
            type="button"
            onClick={() => navigate({ to: "/" })}
            style={{
              background: "#E07820",
              color: "white",
              borderRadius: 8,
              padding: "8px 32px",
              fontWeight: 700,
              fontSize: 15,
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
            data-ocid="layout.home.button"
          >
            <Home style={{ width: 18, height: 18 }} />
            Home
          </button>
        </div>
      )}
    </div>
  );
}
