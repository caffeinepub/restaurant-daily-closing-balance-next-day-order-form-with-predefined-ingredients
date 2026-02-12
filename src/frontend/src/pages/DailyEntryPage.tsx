import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Save, Loader2, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { useDailyForm } from '../hooks/useDailyForm';
import { useAddDailyRecord } from '../hooks/useQueries';
import { useActorDiagnostics } from '../hooks/useActorDiagnostics';
import { CATEGORIES } from '../data/predefinedIngredients';
import { formatRecordAsPlainText } from '../utils/recordPlainText';
import BackendConnectionErrorCard from '../components/BackendConnectionErrorCard';
import type { SavedDailyRecord } from '../types/dailyForm';

export default function DailyEntryPage() {
  const { formData, updateIngredient, validateAndPrepare, reset } = useDailyForm();
  const addRecord = useAddDailyRecord();
  const { isActorReady, hasActorError, retry } = useActorDiagnostics();
  const [isSaving, setIsSaving] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [balanceDate, setBalanceDate] = useState('');

  const handleRetry = async () => {
    setIsRetrying(true);
    retry();
    // Give it a moment to retry
    setTimeout(() => setIsRetrying(false), 1000);
  };

  const handleSave = async () => {
    if (!balanceDate) {
      toast.error('Please select a Balance Date before saving.');
      return;
    }

    if (!isActorReady) {
      toast.error('Backend connection not ready. Please wait or retry.');
      return;
    }

    const entries = validateAndPrepare();

    setIsSaving(true);
    try {
      const selectedDate = new Date(balanceDate);
      const timestamp = BigInt(selectedDate.getTime());
      await addRecord.mutateAsync({ entries, timestamp });
      toast.success('Daily record saved successfully!');
      reset();
      setBalanceDate('');
    } catch (error) {
      toast.error('Failed to save record. Please try again.');
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyForVendor = async () => {
    if (!balanceDate) {
      toast.error('Please select a Balance Date before copying.');
      return;
    }

    const entries = validateAndPrepare();
    const selectedDate = new Date(balanceDate);
    const timestamp = BigInt(selectedDate.getTime());

    // Create a temporary record object for formatting
    const tempRecord: SavedDailyRecord = {
      entries,
      timestamp,
    };

    try {
      const plainText = formatRecordAsPlainText(tempRecord);
      await navigator.clipboard.writeText(plainText);
      toast.success('Message copied to clipboard! You can now paste and send it to your vendor.');
    } catch (error) {
      toast.error('Failed to copy to clipboard');
      console.error('Copy error:', error);
    }
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

  return (
    <div className="max-w-7xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Daily Inventory Entry</CardTitle>
          <CardDescription>
            Record closing balance and next day order for each ingredient
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {/* Balance Date Selector */}
            <div className="bg-muted/50 p-4 rounded-lg border">
              <Label htmlFor="balanceDate" className="text-base font-semibold">
                Balance Date *
              </Label>
              <Input
                id="balanceDate"
                type="date"
                value={balanceDate}
                onChange={(e) => setBalanceDate(e.target.value)}
                className="mt-2 max-w-xs"
                required
              />
              <p className="text-sm text-muted-foreground mt-1">
                Select the date for this balance record
              </p>
            </div>

            {CATEGORIES.map((category) => {
              const categoryIngredients = formData.filter((item) => item.category === category);
              const startIndex = formData.findIndex((item) => item.category === category);

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
                          <TableHead className="w-[200px]">Ingredient</TableHead>
                          <TableHead className="w-[150px]">Unit</TableHead>
                          <TableHead className="w-[90px]">Closing Balance</TableHead>
                          <TableHead className="w-[90px]">Next Day Order</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {categoryIngredients.map((ingredient, idx) => {
                          const globalIndex = startIndex + idx;
                          return (
                            <TableRow key={globalIndex}>
                              <TableCell className="font-bold text-sm">{ingredient.name}</TableCell>
                              <TableCell>
                                <Input
                                  placeholder="kg, L, pcs"
                                  value={ingredient.unit}
                                  onChange={(e) => updateIngredient(globalIndex, 'unit', e.target.value)}
                                  className="h-9 w-16 min-w-[4rem]"
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  placeholder="0"
                                  min="0"
                                  step="0.01"
                                  value={ingredient.closingBalance}
                                  onChange={(e) =>
                                    updateIngredient(globalIndex, 'closingBalance', e.target.value)
                                  }
                                  className="h-9 w-20 min-w-[5rem]"
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  placeholder="0"
                                  min="0"
                                  step="0.01"
                                  value={ingredient.nextDayOrder}
                                  onChange={(e) =>
                                    updateIngredient(globalIndex, 'nextDayOrder', e.target.value)
                                  }
                                  className="h-9 w-20 min-w-[5rem]"
                                />
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              );
            })}

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={reset} disabled={isSaving || !isActorReady}>
                Clear Form
              </Button>
              <Button
                variant="secondary"
                onClick={handleCopyForVendor}
                disabled={isSaving || !isActorReady}
                className="gap-2"
              >
                <Copy className="w-4 h-4" />
                Copy for Vendor
              </Button>
              <Button onClick={handleSave} disabled={isSaving || !isActorReady} className="gap-2">
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Record
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
