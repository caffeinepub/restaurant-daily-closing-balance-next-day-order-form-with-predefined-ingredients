import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useDailyForm } from '../hooks/useDailyForm';
import { useAddDailyRecord } from '../hooks/useQueries';
import { useActorDiagnostics } from '../hooks/useActorDiagnostics';
import { CATEGORIES } from '../data/predefinedIngredients';
import BackendConnectionErrorCard from '../components/BackendConnectionErrorCard';

export default function DailyEntryPage() {
  const { formData, updateIngredient, validateAndPrepare, reset } = useDailyForm();
  const addRecord = useAddDailyRecord();
  const { isActorReady, isActorLoading, hasActorError, retry } = useActorDiagnostics();
  const [isSaving, setIsSaving] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [balanceDate, setBalanceDate] = useState('');
  const [restaurantName, setRestaurantName] = useState('');
  const navigate = useNavigate();

  const handleRetry = async () => {
    setIsRetrying(true);
    retry();
    // Give it a moment to retry
    setTimeout(() => setIsRetrying(false), 1500);
  };

  const handleSave = async () => {
    if (!restaurantName) {
      toast.error('Please select a Restaurant Name before saving.');
      return;
    }

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
      await addRecord.mutateAsync({ entries, timestamp, restaurantName });
      toast.success('Daily record saved successfully!');
      reset();
      setBalanceDate('');
      setRestaurantName('');
      // Navigate to the saved record details using timestamp as the ID
      navigate({ to: '/history/$recordId', params: { recordId: timestamp.toString() } });
    } catch (error) {
      toast.error('Failed to save record. Please try again.');
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
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

  // Show loading state while actor is initializing
  const isInitializing = isActorLoading && !isActorReady;

  return (
    <div className="max-w-7xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Daily Inventory Entry</CardTitle>
          <CardDescription>
            Record balance and order for each ingredient
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isInitializing ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground mx-auto" />
                <p className="text-sm text-muted-foreground">Connecting to backend...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Restaurant Name and Balance Date Selector */}
              <div className="bg-muted/50 p-4 rounded-lg border space-y-4">
                <div>
                  <Label htmlFor="restaurantName" className="text-base font-semibold">
                    Restaurant Name *
                  </Label>
                  <Select value={restaurantName} onValueChange={setRestaurantName}>
                    <SelectTrigger id="restaurantName" className="mt-2 max-w-xs">
                      <SelectValue placeholder="Select restaurant" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Andaaz">Andaaz</SelectItem>
                      <SelectItem value="Kai wok Express">Kai wok Express</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground mt-1">
                    Select the restaurant for this record
                  </p>
                </div>

                <div>
                  <Label htmlFor="balanceDate" className="text-base font-semibold">
                    Balance Date *
                  </Label>
                  <Input
                    id="balanceDate"
                    type="date"
                    value={balanceDate}
                    onChange={(e) => setBalanceDate(e.target.value)}
                    className="mt-2 max-w-[10rem]"
                    required
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Select the date for this balance record
                  </p>
                </div>
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
                            <TableHead className="w-[250px]">Ingredient</TableHead>
                            <TableHead className="w-[120px]">Balance</TableHead>
                            <TableHead className="w-[120px]">Order</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {categoryIngredients.map((ingredient, idx) => {
                            const globalIndex = startIndex + idx;
                            return (
                              <TableRow key={globalIndex}>
                                <TableCell className="font-semibold text-[1.05rem]">{ingredient.name}</TableCell>
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
                                    className="h-9 w-24 min-w-[6rem]"
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
                                    className="h-9 w-24 min-w-[6rem]"
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
                <Button onClick={handleSave} disabled={isSaving} className="gap-2">
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
