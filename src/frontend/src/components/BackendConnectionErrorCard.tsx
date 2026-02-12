import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

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
          Unable to connect to the backend service. Please check your connection and try again.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {errorMessage && (
          <p className="text-sm text-muted-foreground mb-4 font-mono bg-muted p-2 rounded">
            {errorMessage}
          </p>
        )}
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
      </CardContent>
    </Card>
  );
}
