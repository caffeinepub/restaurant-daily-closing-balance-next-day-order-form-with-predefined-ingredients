import { useNavigate } from "@tanstack/react-router";
import {
  ChevronDown,
  Layers,
  Scale,
  Trash2,
  Truck,
  UserCheck,
  Warehouse,
  Wrench,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useRestaurantSession } from "../hooks/useRestaurantSession";

const TILES = [
  {
    label: "BAL & ORDER",
    icon: Scale,
    color: "#1565C0",
    glow: "rgba(21,101,192,0.45)",
    path: "/daily-entry",
  },
  {
    label: "STORE INDENTS",
    icon: Warehouse,
    color: "#2E7D32",
    glow: "rgba(46,125,50,0.45)",
    path: "/store-indents",
  },
  {
    label: "WASTAGE REGISTER",
    icon: Trash2,
    color: "#E65100",
    glow: "rgba(230,81,0,0.45)",
    path: "/wastage",
  },
  {
    label: "RECEIVING MATERIAL",
    icon: Truck,
    color: "#00695C",
    glow: "rgba(0,105,92,0.45)",
    path: "/receiving",
  },
  {
    label: "ATTENDANCE",
    icon: UserCheck,
    color: "#6A1B9A",
    glow: "rgba(106,27,154,0.45)",
    path: "/attendance",
  },
  {
    label: "REPAIR & MAINT.",
    icon: Wrench,
    color: "#B71C1C",
    glow: "rgba(183,28,28,0.45)",
    path: "/repair",
  },
  {
    label: "SEMIFINISH",
    icon: Layers,
    color: "#1A237E",
    glow: "rgba(26,35,126,0.45)",
    path: "/semifinish",
  },
] as const;

export default function HomePage() {
  const { session, switchRestaurant } = useRestaurantSession();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!session) {
      navigate({ to: "/login" });
    }
  }, [session, navigate]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (!session) return null;

  const isMultiRestaurant =
    session.availableRestaurants && session.availableRestaurants.length > 1;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#F5F5F5" }}
      data-ocid="home.page"
    >
      {/* Top App Bar */}
      <header
        style={{
          background: "#FFF0E0",
          borderBottom: "1.5px solid #E07820",
          boxShadow: "0 1px 4px rgba(224,120,32,0.18)",
          padding: "10px 16px",
        }}
      >
        {/* Row 1: Logo + App Name + Tagline */}
        <div className="flex items-center gap-3">
          {/* Logo */}
          <div
            className="rounded-xl overflow-hidden shadow flex-shrink-0"
            style={{ width: 52, height: 52 }}
          >
            <img
              src="/assets/uploads/logo-app-draft-2.jpg"
              alt="Shri Hoshnagi"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              onError={(e) => {
                const el = e.target as HTMLImageElement;
                el.style.display = "none";
                (el.parentElement as HTMLElement).style.background = "#E07820";
              }}
            />
          </div>

          {/* App Name & Tagline */}
          <div className="flex flex-col justify-center">
            <span
              style={{
                color: "#7A3A00",
                fontSize: 15,
                fontWeight: 800,
                lineHeight: 1.2,
                letterSpacing: "0.01em",
              }}
            >
              Shri Hoshnagi F&amp;B Opp.
            </span>
            <span
              style={{
                color: "#9E5A00",
                fontSize: 11,
                fontWeight: 500,
                lineHeight: 1.3,
                marginTop: 2,
              }}
            >
              F &amp; B Control &amp; SOP Management
            </span>
          </div>
        </div>

        {/* Row 2: Restaurant Name (larger, with optional dropdown) */}
        <div className="mt-2" ref={dropdownRef}>
          {isMultiRestaurant ? (
            <div style={{ position: "relative" }}>
              <button
                type="button"
                onClick={() => setDropdownOpen((v) => !v)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: "rgba(224,120,32,0.12)",
                  border: "1.5px solid #E07820",
                  borderRadius: 8,
                  padding: "5px 12px",
                  cursor: "pointer",
                  width: "100%",
                }}
              >
                <span
                  style={{
                    color: "#7A3A00",
                    fontSize: 22,
                    fontWeight: 800,
                    flex: 1,
                    textAlign: "left",
                    lineHeight: 1.2,
                  }}
                >
                  {session.restaurantName}
                </span>
                <ChevronDown
                  size={20}
                  color="#E07820"
                  style={{
                    transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.2s",
                    flexShrink: 0,
                  }}
                />
              </button>

              {dropdownOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 4px)",
                    left: 0,
                    right: 0,
                    background: "#fff",
                    border: "1.5px solid #E07820",
                    borderRadius: 8,
                    boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
                    zIndex: 100,
                    overflow: "hidden",
                  }}
                >
                  {session.availableRestaurants.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => {
                        switchRestaurant(r);
                        setDropdownOpen(false);
                      }}
                      style={{
                        display: "block",
                        width: "100%",
                        textAlign: "left",
                        padding: "10px 14px",
                        fontSize: 18,
                        fontWeight: 700,
                        color:
                          r === session.restaurantName ? "#E07820" : "#7A3A00",
                        background:
                          r === session.restaurantName
                            ? "#FFF0E0"
                            : "transparent",
                        border: "none",
                        cursor: "pointer",
                        borderBottom: "1px solid #f0d0b0",
                      }}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <span
              style={{
                color: "#7A3A00",
                fontSize: 22,
                fontWeight: 800,
                display: "block",
                lineHeight: 1.2,
                padding: "3px 0",
              }}
            >
              {session.restaurantName}
            </span>
          )}
        </div>
      </header>

      {/* Scrollable Body */}
      <div className="flex-1 overflow-y-auto">
        {/* Navigation Grid */}
        <div className="px-4 pt-5 pb-6">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
            }}
            data-ocid="home.list"
          >
            {TILES.slice(0, 6).map((tile, i) => (
              <NavTile key={tile.path} tile={tile} index={i + 1} />
            ))}
            {/* 7th tile: centered */}
            <div
              style={{
                gridColumn: "1 / -1",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <div style={{ width: "calc(50% - 6px)" }}>
                <NavTile tile={TILES[6]} index={7} />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pb-6">
          <p className="text-xs" style={{ color: "#bbb" }}>
            &copy; {new Date().getFullYear()}. Built with love using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                typeof window !== "undefined" ? window.location.hostname : "",
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

function NavTile({
  tile,
  index,
}: {
  tile: (typeof TILES)[number];
  index: number;
}) {
  const navigate = useNavigate();
  const Icon = tile.icon;

  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.05, boxShadow: `0 6px 24px ${tile.glow}` }}
      whileTap={{ scale: 0.97 }}
      onClick={() => navigate({ to: tile.path })}
      data-ocid={`home.item.${index}`}
      style={{
        background: tile.color,
        borderRadius: 16,
        border: "none",
        cursor: "pointer",
        aspectRatio: "1 / 1",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        boxShadow: `0 3px 12px ${tile.glow}`,
        padding: 12,
      }}
    >
      <Icon size={36} color="#fff" strokeWidth={1.8} />
      <span
        style={{
          color: "#fff",
          fontSize: 11,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.04em",
          textAlign: "center",
          lineHeight: 1.25,
        }}
      >
        {tile.label}
      </span>
    </motion.button>
  );
}
