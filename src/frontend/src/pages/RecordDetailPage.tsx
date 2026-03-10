import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft, Copy, Download, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import BackendConnectionErrorCard from "../components/BackendConnectionErrorCard";
import RecordEntryRowMobile from "../components/RecordEntryRowMobile";
import { CATEGORIES } from "../data/predefinedIngredients";
import { useActorDiagnostics } from "../hooks/useActorDiagnostics";
import { useGetAllDailyRecords } from "../hooks/useQueries";
import { exportRecordToCSV } from "../utils/csvExport";
import { formatDateDDMMYYYY } from "../utils/dateFormat";
import { formatRecordAsPlainText } from "../utils/recordPlainText";

export default function RecordDetailPage() {
  const { recordId } = useParams({ from: "/history/$recordId" });
  const { data: records, isLoading, error } = useGetAllDailyRecords();
  const { hasActorError, isActorLoading, retry } = useActorDiagnostics();
  const [isRetrying, setIsRetrying] = useState(false);
  const navigate = useNavigate();

  // Parse recordId: new format is just the numeric array index ("0", "1", "2"...)
  // Legacy format was "timestamp_restaurantName" — handle both
  const isNumericIndex = /^\d+$/.test(recordId);
  const recordIndexNum = isNumericIndex ? Number(recordId) : -1;

  // Legacy: parse composite "timestamp_restaurantName"
  const underscoreIndex = recordId.indexOf("_");
  const legacyTimestamp =
    !isNumericIndex && underscoreIndex >= 0
      ? BigInt(recordId.slice(0, underscoreIndex))
      : null;
  const legacyRestaurant =
    !isNumericIndex && underscoreIndex >= 0
      ? decodeURIComponent(recordId.slice(underscoreIndex + 1))
      : null;

  // Find record: prefer index-based lookup, fall back to legacy timestamp+name lookup
  const record = records
    ? isNumericIndex
      ? records.find((r) => r.recordIndex === recordIndexNum)
      : records.find((r) => {
          if (legacyTimestamp !== null && r.timestamp !== legacyTimestamp)
            return false;
          if (legacyRestaurant !== null)
            return r.restaurantName === legacyRestaurant;
          return true;
        })
    : undefined;

  const handleExport = () => {
    if (!record) return;
    try {
      exportRecordToCSV(record);
      toast.success(
        "CSV exported successfully! You can now upload it to Google Drive or Sheets.",
      );
    } catch (error) {
      toast.error("Failed to export CSV");
      console.error("Export error:", error);
    }
  };

  const handleCopy = async () => {
    if (!record) return;
    try {
      const plainText = formatRecordAsPlainText(record);
      await navigator.clipboard.writeText(plainText);
      toast.success(
        "Order details copied to clipboard! You can now paste and send it to your vendor.",
      );
    } catch (error) {
      toast.error("Failed to copy to clipboard");
      console.error("Copy error:", error);
    }
  };

  const handleBack = () => {
    navigate({ to: "/history" });
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
          errorMessage={
            error instanceof Error ? error.message : "Failed to load record"
          }
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
        <Button
          variant="ghost"
          size="sm"
          className="gap-2"
          onClick={handleBack}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to History
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-bold bg-gray-800 text-white rounded px-2 py-0.5">
                  Order #{record.orderNo}
                </span>
              </div>
              <CardTitle className="text-2xl">Record Details</CardTitle>
              <CardDescription>
                {record.restaurantName} — Balance Date:{" "}
                {formatDateDDMMYYYY(record.timestamp)}
              </CardDescription>
              <div className="text-xs text-muted-foreground mt-1">
                Categories:{" "}
                {[...new Set(record.entries.map((e) => e.category))].join(", ")}
              </div>
            </div>
            {/* Desktop action buttons - hidden on mobile */}
            <div className="hidden sm:flex gap-2">
              <Button onClick={handleCopy} variant="outline" className="gap-2">
                <Copy className="w-4 h-4" />
                Copy
              </Button>
              <Button onClick={handleExport} className="gap-2">
                <Download className="w-4 h-4" />
                Export CSV
              </Button>
            </div>
            {/* Mobile action buttons - stacked, visible only on mobile */}
            <div className="sm:hidden flex flex-col gap-2">
              <Button
                onClick={handleCopy}
                variant="outline"
                className="gap-2 w-full"
              >
                <Copy className="w-4 h-4" />
                Copy Order Details
              </Button>
              <Button onClick={handleExport} className="gap-2 w-full">
                <Download className="w-4 h-4" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {CATEGORIES.map((category) => {
              const categoryEntries = record.entries.filter(
                (entry) => entry.category === category,
              );

              if (categoryEntries.length === 0) return null;

              return (
                <div key={category}>
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-foreground">
                      {category}
                    </h3>
                    <Separator className="mt-2" />
                  </div>

                  {/* Desktop Table View - hidden on mobile */}
                  <div className="hidden sm:block overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[250px]">
                            Ingredient
                          </TableHead>
                          <TableHead className="w-[150px]">Balance</TableHead>
                          <TableHead className="w-[150px]">Order</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {categoryEntries.map((entry) => (
                          <TableRow key={entry.name}>
                            <TableCell className="font-semibold text-[1.05rem]">
                              {entry.name}
                            </TableCell>
                            <TableCell>{entry.closingBalance}</TableCell>
                            <TableCell>{entry.nextDayOrder}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Mobile Stacked View - visible only on mobile */}
                  <div className="sm:hidden space-y-3">
                    {categoryEntries.map((entry) => (
                      <RecordEntryRowMobile
                        key={entry.name}
                        name={entry.name}
                        balance={entry.closingBalance}
                        order={entry.nextDayOrder}
                      />
                    ))}
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
