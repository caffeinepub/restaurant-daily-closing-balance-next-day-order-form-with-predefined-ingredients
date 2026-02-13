import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChevronRight, Loader2, FileText } from 'lucide-react';
import { useGetAllDailyRecords } from '../hooks/useQueries';
import { useActorDiagnostics } from '../hooks/useActorDiagnostics';
import BackendConnectionErrorCard from '../components/BackendConnectionErrorCard';
import { formatDateDDMMYYYY } from '../utils/dateFormat';
import { useState } from 'react';

export default function HistoryPage() {
  const { data: records, isLoading, error } = useGetAllDailyRecords();
  const { hasActorError, isActorLoading, retry } = useActorDiagnostics();
  const [isRetrying, setIsRetrying] = useState(false);
  const navigate = useNavigate();

  const handleViewRecord = (timestamp: bigint) => {
    navigate({ to: '/history/$recordId', params: { recordId: timestamp.toString() } });
  };

  const handleRetry = async () => {
    setIsRetrying(true);
    retry();
    setTimeout(() => setIsRetrying(false), 1500);
  };

  // Show connection error only if actor initialization actually failed
  if (hasActorError) {
    return (
      <div className="max-w-7xl mx-auto">
        <BackendConnectionErrorCard
          onRetry={handleRetry}
          isRetrying={isRetrying}
          errorMessage="Failed to initialize backend connection. Please check your network and try again."
        />
      </div>
    );
  }

  // Show error if fetch failed (but actor is OK)
  if (error && !isLoading && !isActorLoading) {
    return (
      <div className="max-w-7xl mx-auto">
        <BackendConnectionErrorCard
          onRetry={handleRetry}
          isRetrying={isRetrying}
          errorMessage={error instanceof Error ? error.message : 'Failed to load records'}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Saved Records</CardTitle>
          <CardDescription>View and export your previously saved daily records</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading || isActorLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground mx-auto" />
                <p className="text-sm text-muted-foreground">Loading records...</p>
              </div>
            </div>
          ) : records && records.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Restaurant</TableHead>
                    <TableHead>Balance Date</TableHead>
                    <TableHead>Ingredients</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((record) => (
                    <TableRow key={record.timestamp.toString()}>
                      <TableCell className="font-medium">{record.restaurantName}</TableCell>
                      <TableCell className="font-medium">{formatDateDDMMYYYY(record.timestamp)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {record.entries.length} ingredient{record.entries.length !== 1 ? 's' : ''}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-2"
                          onClick={() => handleViewRecord(record.timestamp)}
                        >
                          View Details
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-2">No records saved yet</p>
              <p className="text-sm text-muted-foreground">
                Start by creating a daily entry from the Daily Entry page
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
