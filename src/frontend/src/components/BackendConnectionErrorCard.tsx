import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
  return (
    <Card className="border-destructive/50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-destructive" />
          <CardTitle>Connection Error</CardTitle>
        </div>
        <CardDescription>
          Unable to connect to the backend service. This may be due to network issues or the service being temporarily unavailable.
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
          <p className="text-xs text-muted-foreground text-center">
            If the problem persists, please check your internet connection or try again later.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
