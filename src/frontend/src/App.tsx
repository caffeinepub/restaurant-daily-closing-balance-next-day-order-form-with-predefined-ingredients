import { Toaster } from "@/components/ui/sonner";
import {
  ErrorComponent,
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { ThemeProvider } from "next-themes";
import { useEffect } from "react";
import AppLayout from "./components/AppLayout";
import AdminPage from "./pages/AdminPage";
import DailyEntryPage from "./pages/DailyEntryPage";
import HistoryPage from "./pages/HistoryPage";
import RaisedConcernPage from "./pages/RaisedConcernPage";
import RecordDetailPage from "./pages/RecordDetailPage";
import UserLoginPage from "./pages/UserLoginPage";
import { initMasterData } from "./utils/masterData";

const rootRoute = createRootRoute({
  component: () => (
    <AppLayout>
      <Outlet />
    </AppLayout>
  ),
  errorComponent: ({ error }) => {
    console.error("[App] Root route error:", error);
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <ErrorComponent error={error} />
        </div>
      </div>
    );
  },
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: DailyEntryPage,
});

const historyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/history",
  component: HistoryPage,
});

const recordDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/history/$recordId",
  component: RecordDetailPage,
});

const concernRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/history/$recordId/concern",
  component: RaisedConcernPage,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: UserLoginPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  historyRoute,
  recordDetailRoute,
  concernRoute,
  loginRoute,
  adminRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

function AppInit() {
  useEffect(() => {
    initMasterData();
  }, []);
  return null;
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AppInit />
      <RouterProvider router={router} />
      <Toaster />
    </ThemeProvider>
  );
}
