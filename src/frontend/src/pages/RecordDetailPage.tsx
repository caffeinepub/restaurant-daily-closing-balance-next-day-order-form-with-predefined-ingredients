import { useParams, useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Download, Copy, Loader2 } from 'lucide-react';
import { useGetAllDailyRecords } from '../hooks/useQueries';
import { useActorDiagnostics } from '../hooks/useActorDiagnostics';
import { exportRecordToCSV } from '../utils/csvExport';
import { formatRecordAsPlainText } from '../utils/recordPlainText';
import { formatDateDDMMYYYY } from '../utils/dateFormat';
import { CATEGORIES } from '../data/predefinedIngredients';
import BackendConnectionErrorCard from '../components/BackendConnectionErrorCard';
import { toast } from 'sonner';
import { useState } from 'react';

export default function RecordDetailPage() {
  const { recordId } = useParams({ from: '/history/$recordId' });
  const { data: records, isLoading, error } = useGetAllDailyRecords();
  const { hasActorError, isActorLoading, retry } = useActorDiagnostics();
  const [isRetrying, setIsRetrying] = useState(false);
  const navigate = useNavigate();

  // Find record by timestamp instead of index
  const recordTimestamp = BigInt(recordId);
  const record = records?.find((r) => r.timestamp === recordTimestamp);

  const handleExport = () => {
    if (!record) return;
    try {
      exportRecordToCSV(record);
      toast.success('CSV exported successfully! You can now upload it to Google Drive or Sheets.');
    } catch (error) {
      toast.error('Failed to export CSV');
      console.error('Export error:', error);
    }
  };

  const handleCopy = async () => {
    if (!record) return;
    try {
      const plainText = formatRecordAsPlainText(record);
      await navigator.clipboard.writeText(plainText);
      toast.success('Order details copied to clipboard! You can now paste and send it to your vendor.');
    } catch (error) {
      toast.error('Failed to copy to clipboard');
      console.error('Copy error:', error);
    }
  };

  const handleBack = () => {
    navigate({ to: '/history' });
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
          errorMessage={error instanceof Error ? error.message : 'Failed to load record'}
        />
      </div>
    );
  }

  if (isLoading || isActorLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground mx-auto" />
          <p className="text-sm text-muted-foreground">Loading record...</p>
        </div>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="max-w-7xl mx-auto">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">Record not found</p>
            <Button variant="outline" onClick={handleBack}>
              Back to History
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-4">
        <Button variant="ghost" size="sm" className="gap-2" onClick={handleBack}>
          <ArrowLeft className="w-4 h-4" />
          Back to History
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">Record Details</CardTitle>
              <CardDescription>
                {record.restaurantName} - Balance Date: {formatDateDDMMYYYY(record.timestamp)}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCopy} variant="outline" className="gap-2">
                <Copy className="w-4 h-4" />
                Copy
              </Button>
              <Button onClick={handleExport} className="gap-2">
                <Download className="w-4 h-4" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {CATEGORIES.map((category) => {
              const categoryEntries = record.entries.filter((entry) => entry.category === category);

              if (categoryEntries.length === 0) return null;

              return (
                <div key={category}>
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-foreground">{category}</h3>
                    <Separator className="mt-2" />
                  </div>

                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[250px]">Ingredient</TableHead>
                          <TableHead className="w-[150px]">Balance</TableHead>
                          <TableHead className="w-[150px]">Order</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {categoryEntries.map((entry, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="font-semibold text-[1.05rem]">{entry.name}</TableCell>
                            <TableCell>{entry.closingBalance}</TableCell>
                            <TableCell>{entry.nextDayOrder}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
