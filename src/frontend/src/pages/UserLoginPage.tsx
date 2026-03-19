import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "@tanstack/react-router";
import { Loader2, LogIn } from "lucide-react";
import { useState } from "react";
import { useRestaurantSession } from "../hooks/useRestaurantSession";
import { loginUser } from "../utils/masterData";

export default function UserLoginPage() {
  const { login } = useRestaurantSession();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = loginUser(username.trim(), password);
      if (!user) {
        setError("Invalid username or password");
        return;
      }
      login(user.username, user.password, user.restaurantName);
      navigate({ to: "/" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        {/* Branding */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4">
            <img
              src="/assets/uploads/apple-touch-icon-3.png"
              alt="Shri Hoshnagi"
              className="w-12 h-12 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            Shri Hoshnagi Enterprises
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
                <p
                  className="text-sm text-destructive font-medium border border-destructive rounded px-3 py-2"
                  data-ocid="login.error_state"
                >
                  {error}
                </p>
              )}

              <Button
                type="submit"
                className="w-full gap-2"
                disabled={loading}
                data-ocid="login.submit_button"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Signing in...
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

        <p className="text-center text-xs text-muted-foreground mt-6">
          © {new Date().getFullYear()} Shri Hoshnagi Enterprises
        </p>
      </div>
    </div>
  );
}
