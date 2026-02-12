import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChevronRight, Loader2, FileText } from 'lucide-react';
import { useGetAllDailyRecords } from '../hooks/useQueries';
import { useActorDiagnostics } from '../hooks/useActorDiagnostics';
import BackendConnectionErrorCard from '../components/BackendConnectionErrorCard';
import { useState } from 'react';

export default function HistoryPage() {
  const { data: records, isLoading, error } = useGetAllDailyRecords();
  const { hasActorError, retry } = useActorDiagnostics();
  const [isRetrying, setIsRetrying] = useState(false);
  const navigate = useNavigate();

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp));
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleViewRecord = (index: number) => {
    navigate({ to: '/history/$recordId', params: { recordId: index.toString() } });
  };

  const handleRetry = async () => {
    setIsRetrying(true);
    retry();
    setTimeout(() => setIsRetrying(false), 1000);
  };

  // Show connection error if actor failed to initialize
  if (hasActorError) {
    return (
      <div className="max-w-7xl mx-auto">
        <BackendConnectionErrorCard
          onRetry={handleRetry}
          isRetrying={isRetrying}
          errorMessage="Unable to connect to the backend service"
        />
      </div>
    );
  }

  // Show error if fetch failed
  if (error && !isLoading) {
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
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : !records || records.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No records saved yet</p>
              <Button onClick={() => navigate({ to: '/' })}>Create First Record</Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Balance Date</TableHead>
                    <TableHead>Entries</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((record, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{formatDate(record.timestamp)}</TableCell>
                      <TableCell>{record.entries.length} ingredients</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-2"
                          onClick={() => handleViewRecord(index)}
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
