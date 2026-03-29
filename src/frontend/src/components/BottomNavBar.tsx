import { useNavigate, useRouterState } from "@tanstack/react-router";
import {
  ChefHat,
  ClipboardList,
  Trash2,
  Truck,
  UserCheck,
  Warehouse,
  Wrench,
} from "lucide-react";
import { motion } from "motion/react";

const TABS = [
  { label: "BAL & ORDER", icon: ClipboardList, path: "/daily-entry" },
  { label: "STORE INDENTS", icon: Warehouse, path: "/store-indents" },
  { label: "WASTAGE REG.", icon: Trash2, path: "/wastage" },
  { label: "RECEIVING", icon: Truck, path: "/receiving" },
  { label: "SEMIFINISH", icon: ChefHat, path: "/semifinish" },
  { label: "ATTENDANCE", icon: UserCheck, path: "/attendance" },
  { label: "REPAIR & MNT", icon: Wrench, path: "/repair" },
] as const;

const ACTIVE_COLOR = "#C06010";
const INACTIVE_COLOR = "#E07820";

export default function BottomNavBar() {
  const navigate = useNavigate();
  const router = useRouterState();
  const currentPath = router.location.pathname;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t"
      style={{
        borderColor: "#E07820",
        boxShadow: "0 -2px 10px rgba(224,120,32,0.15)",
      }}
      data-ocid="nav.bottom.panel"
    >
      <div className="flex" style={{ height: 60 }}>
        {TABS.map((tab) => {
          const isActive = currentPath === tab.path;
          const Icon = tab.icon;
          return (
            <button
              key={tab.path}
              type="button"
              className="flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors"
              style={{
                color: isActive ? ACTIVE_COLOR : INACTIVE_COLOR,
                background: "transparent",
                border: "none",
                minWidth: 0,
              }}
              onClick={() => navigate({ to: tab.path })}
              data-ocid={`nav.${tab.label.toLowerCase().replace(/[^a-z0-9]/g, "_")}.tab`}
            >
              <motion.div
                animate={isActive ? { scale: 1.12 } : { scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="flex items-center justify-center rounded-lg"
                style={{
                  background: isActive ? "#FFF0E0" : "transparent",
                  padding: "4px 8px",
                }}
              >
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2.4 : 2.2}
                  color={isActive ? ACTIVE_COLOR : INACTIVE_COLOR}
                />
              </motion.div>
              <span
                style={{
                  fontSize: 9,
                  fontWeight: isActive ? 700 : 600,
                  lineHeight: 1.1,
                  textAlign: "center",
                  color: isActive ? ACTIVE_COLOR : INACTIVE_COLOR,
                  maxWidth: "100%",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  display: "block",
                  padding: "0 2px",
                }}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
