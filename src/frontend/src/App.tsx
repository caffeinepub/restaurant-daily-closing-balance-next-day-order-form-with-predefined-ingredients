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
import AppLayout from "./components/AppLayout";
import DailyEntryPage from "./pages/DailyEntryPage";
import HistoryPage from "./pages/HistoryPage";
import RecordDetailPage from "./pages/RecordDetailPage";

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

const routeTree = rootRoute.addChildren([
  indexRoute,
  historyRoute,
  recordDetailRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <RouterProvider router={router} />
      <Toaster />
    </ThemeProvider>
  );
}
