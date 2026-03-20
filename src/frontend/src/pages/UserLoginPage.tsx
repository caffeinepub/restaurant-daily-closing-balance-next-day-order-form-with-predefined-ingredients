import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "@tanstack/react-router";
import { Loader2, LogIn, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useRestaurantSession } from "../hooks/useRestaurantSession";
import { resetActorCache } from "../utils/backendClient";
import { loginUser } from "../utils/masterData";

export default function UserLoginPage() {
  const { login } = useRestaurantSession();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [failCount, setFailCount] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setRetrying(false);
    resetActorCache();

    // Show "Retrying..." after a short delay to let user know retries are happening
    const retryTimer = setTimeout(() => setRetrying(true), 2000);

    try {
      const user = await loginUser(username.trim(), password);
      clearTimeout(retryTimer);
      if (!user) {
        setFailCount((c) => c + 1);
        setError(
          "Invalid username or password. Please check your credentials.",
        );
        return;
      }
      login(user.username, user.password, user.restaurantName);
      navigate({ to: "/" });
    } catch (err) {
      clearTimeout(retryTimer);
      resetActorCache();
      setFailCount((c) => c + 1);
      const msg = err instanceof Error ? err.message : String(err);
      const lower = msg.toLowerCase();
      if (
        lower.includes("stopped") ||
        lower.includes("canister") ||
        lower.includes("ic0508") ||
        lower.includes("rejected")
      ) {
        setError(
          "Backend service is temporarily unavailable. Please wait a moment and try again.",
        );
      } else if (
        lower.includes("network") ||
        lower.includes("fetch") ||
        lower.includes("timeout")
      ) {
        setError(
          "Network error — check your internet connection and try again.",
        );
      } else {
        setError("Connection error. Please wait a few seconds and try again.");
      }
    } finally {
      setLoading(false);
      setRetrying(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        {/* Branding */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl overflow-hidden mx-auto mb-4 shadow-md">
            <img
              src="/assets/uploads/logo-app-draft-2.jpg"
              alt="Shri Hoshnagi F&B"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            Shri Hoshnagi F&amp;B
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Daily closing &amp; order tracker
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sign In</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  required
                  data-ocid="login.input"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  data-ocid="login.input"
                />
              </div>

              {error && (
                <div className="space-y-2">
                  <p
                    className="text-sm text-destructive font-medium border border-destructive rounded px-3 py-2"
                    data-ocid="login.error_state"
                  >
                    {error}
                  </p>
                  {failCount >= 2 && (
                    <div className="text-xs text-muted-foreground bg-muted rounded px-3 py-2 space-y-1">
                      <p className="font-medium">
                        Default credentials (if not changed):
                      </p>
                      <p>
                        Andaaz: <span className="font-mono">andaaz</span> /{" "}
                        <span className="font-mono">andaaz123</span>
                      </p>
                      <p>
                        Kai wok: <span className="font-mono">kaiwok</span> /{" "}
                        <span className="font-mono">kaiwok123</span>
                      </p>
                      <p>Admin: use Admin Panel Login below</p>
                    </div>
                  )}
                </div>
              )}

              <Button
                type="submit"
                className="w-full gap-2"
                disabled={loading}
                data-ocid="login.submit_button"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {retrying ? "Retrying..." : "Signing in..."}
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" /> Sign In
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Admin access link */}
        <div className="mt-4 text-center">
          <Link
            to="/admin"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Admin Panel Login
          </Link>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          &copy; {new Date().getFullYear()} Shri Hoshnagi F&amp;B
        </p>
      </div>
    </div>
  );
}
