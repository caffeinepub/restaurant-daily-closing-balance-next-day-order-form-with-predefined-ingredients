import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, RefreshCw } from "lucide-react";

interface BackendConnectionErrorCardProps {
  onRetry: () => void;
  isRetrying?: boolean;
  errorMessage?: string;
}

export default function BackendConnectionErrorCard({
  onRetry,
  isRetrying = false,
  errorMessage,
}: BackendConnectionErrorCardProps) {
  const isCanisterIdError =
    errorMessage?.toLowerCase().includes("canister") ||
    errorMessage?.toLowerCase().includes("not resolved");

  return (
    <Card className="border-destructive/50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-destructive" />
          <CardTitle>Backend Connection Error</CardTitle>
        </div>
        <CardDescription>
          {isCanisterIdError
            ? "The application cannot connect to the backend service. This typically indicates a deployment configuration issue."
            : "Unable to reach the backend service. This may be due to network connectivity or the service being temporarily unavailable."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {errorMessage && (
          <Alert variant="destructive">
            <AlertDescription className="font-mono text-xs break-all">
              {errorMessage}
            </AlertDescription>
          </Alert>
        )}
        <div className="flex flex-col gap-2">
          <Button onClick={onRetry} disabled={isRetrying} className="gap-2">
            {isRetrying ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Retrying...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                Retry Connection
              </>
            )}
          </Button>
          <div className="text-xs text-muted-foreground space-y-2">
            <p className="font-medium">Troubleshooting steps:</p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>Refresh your browser page</li>
              <li>Check your internet connection is stable</li>
              {isCanisterIdError && (
                <li className="text-destructive font-medium">
                  Verify you are using the correct production URL from
                  LIVE_URL.md
                </li>
              )}
              <li>Clear your browser cache and cookies, then reload</li>
              <li>Try the Retry Connection button above</li>
              <li>If the problem persists, wait a few minutes and try again</li>
            </ul>
            {isCanisterIdError && (
              <p className="text-destructive text-xs mt-2 font-medium">
                Note: Canister resolution errors usually indicate the deployment
                is incomplete or the URL is incorrect.
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
