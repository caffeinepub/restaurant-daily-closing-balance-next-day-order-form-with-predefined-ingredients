import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  CalendarSearch,
  ChevronRight,
  Download,
  FileText,
  Loader2,
  Search,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useActorDiagnostics } from "../hooks/useActorDiagnostics";
import { useGetAllDailyRecords } from "../hooks/useQueries";
import { useRestaurantSession } from "../hooks/useRestaurantSession";
import type { SavedDailyRecord } from "../types/dailyForm";
import { exportRecordToCSV } from "../utils/csvExport";
import { formatDateDDMMYYYY } from "../utils/dateFormat";
import { formatRecordAsPlainText } from "../utils/recordPlainText";
import { isWithin24Hours, toMilliseconds } from "../utils/timestampUtils";
import BackendConnectionErrorCard from "./BackendConnectionErrorCard";

function getLocalDateString(ts: bigint): string {
  const ms = toMilliseconds(ts);
  const d = new Date(ms);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function filterRecords(
  records: SavedDailyRecord[],
  restaurantName: string,
  fromDate: string,
  toDate: string,
): SavedDailyRecord[] {
  return records.filter((r) => {
    if (r.restaurantName !== restaurantName) return false;
    if (fromDate || toDate) {
      const ds = getLocalDateString(r.timestamp);
      if (fromDate && ds < fromDate) return false;
      if (toDate && ds > toDate) return false;
    }
    return true;
  });
}

interface HistoryContentProps {
  /** Optional title override */
  title?: string;
}

export default function HistoryContent({
  title = "Saved Records",
}: HistoryContentProps) {
  const { session } = useRestaurantSession();
  const navigate = useNavigate();
  const { data: records, isLoading, error } = useGetAllDailyRecords();
  const { hasActorError, isActorLoading, retry } = useActorDiagnostics();
  const [isRetrying, setIsRetrying] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [appliedFromDate, setAppliedFromDate] = useState("");
  const [appliedToDate, setAppliedToDate] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  if (!session) return null;

  const restaurantName = session.restaurantName;

  const handleViewRecord = (recordIndex: number) => {
    navigate({
      to: "/history/$recordId",
      params: { recordId: String(recordIndex) },
    });
  };

  const handleRaiseConcern = (recordIndex: number) => {
    navigate({
      to: "/history/$recordId/concern",
      params: { recordId: String(recordIndex) },
    });
  };

  const handleRetry = async () => {
    setIsRetrying(true);
    retry();
    setTimeout(() => setIsRetrying(false), 1500);
  };

  const handleSearch = () => {
    setAppliedFromDate(fromDate);
    setAppliedToDate(toDate);
    setHasSearched(true);
  };

  const handleCopyPlainText = async (record: SavedDailyRecord) => {
    const text = formatRecordAsPlainText(record);
    await navigator.clipboard.writeText(text);
    toast.success("Order copied to clipboard!");
  };

  const handleExportCSV = (record: SavedDailyRecord) => {
    exportRecordToCSV(record);
    toast.success("CSV exported!");
  };

  if (hasActorError) {
    return (
      <BackendConnectionErrorCard
        onRetry={handleRetry}
        isRetrying={isRetrying}
        errorMessage="Failed to initialize backend connection."
      />
    );
  }

  if (error && !isLoading && !isActorLoading) {
    return (
      <BackendConnectionErrorCard
        onRetry={handleRetry}
        isRetrying={isRetrying}
        errorMessage={
          error instanceof Error ? error.message : "Failed to load records"
        }
      />
    );
  }

  const filteredRecords =
    records && hasSearched
      ? filterRecords(records, restaurantName, appliedFromDate, appliedToDate)
      : [];

  const totalRecords = records
    ? filterRecords(records, restaurantName, "", "").length
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription>
          {restaurantName} — Select a date range and tap Search to view records
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Date Range Filter */}
        <div className="mb-5" data-ocid="history.filter.panel">
          <div
            className="flex flex-wrap gap-3 items-end p-3 bg-muted rounded-lg"
            data-ocid="history.custom.panel"
          >
            <div className="flex flex-col gap-1">
              <Label htmlFor="from-date-hc" className="text-xs font-semibold">
                From Date
              </Label>
              <Input
                id="from-date-hc"
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-40"
                data-ocid="history.from.input"
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="to-date-hc" className="text-xs font-semibold">
                To Date
              </Label>
              <Input
                id="to-date-hc"
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-40"
                data-ocid="history.to.input"
              />
            </div>
            <Button
              onClick={handleSearch}
              className="gap-2 bg-gray-900 hover:bg-gray-800 text-white font-bold"
              data-ocid="history.search.button"
            >
              <Search className="w-4 h-4" />
              Search
            </Button>
          </div>
        </div>

        {isLoading || isActorLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <Loader2
                className="w-8 h-8 animate-spin text-muted-foreground mx-auto"
                data-ocid="history.loading_state"
              />
              <p className="text-sm text-muted-foreground">
                Loading records...
              </p>
            </div>
          </div>
        ) : !hasSearched ? (
          <div className="text-center py-14" data-ocid="history.empty_state">
            <CalendarSearch className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-base font-semibold text-foreground mb-1">
              No records shown yet
            </p>
            <p className="text-sm text-muted-foreground">
              Select a date range above and tap{" "}
              <span className="font-semibold">Search</span> to view records.
            </p>
          </div>
        ) : filteredRecords.length > 0 ? (
          <>
            <p className="text-xs text-muted-foreground mb-3">
              Showing {filteredRecords.length} of {totalRecords} record
              {totalRecords !== 1 ? "s" : ""}
            </p>

            {/* Desktop Table */}
            <div className="hidden sm:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[70px]">Order No.</TableHead>
                    <TableHead>Balance Date</TableHead>
                    <TableHead>Categories</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record, idx) => {
                    const cats = [
                      ...new Set(record.entries.map((e) => e.category)),
                    ];
                    const rowNum = idx + 1;
                    const within24h = isWithin24Hours(record.timestamp);
                    const concernSaved = !!localStorage.getItem(
                      `concern_${record.recordIndex}`,
                    );
                    return (
                      <TableRow
                        key={record.recordIndex}
                        data-ocid={`history.row.${rowNum}`}
                      >
                        <TableCell className="font-bold text-base text-center">
                          #{record.orderNo}
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatDateDDMMYYYY(record.timestamp)}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {cats.join(", ")}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {record.entries.length} ingredient
                          {record.entries.length !== 1 ? "s" : ""}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1 flex-wrap">
                            <Button
                              size="sm"
                              className={
                                within24h
                                  ? "gap-1 bg-red-600 hover:bg-red-700 text-white font-bold"
                                  : "gap-1 bg-gray-500 hover:bg-gray-600 text-white font-bold"
                              }
                              onClick={() =>
                                handleRaiseConcern(record.recordIndex)
                              }
                              data-ocid={`history.concern_button.${rowNum}`}
                            >
                              <AlertTriangle className="w-3.5 h-3.5" />
                              {concernSaved ? "View Concern" : "Raised Concern"}
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="gap-1"
                                  data-ocid={`history.export_button.${rowNum}`}
                                >
                                  <Download className="w-3.5 h-3.5" />
                                  Export
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => handleCopyPlainText(record)}
                                  data-ocid={`history.export_plaintext.${rowNum}`}
                                >
                                  <FileText className="w-4 h-4 mr-2" />
                                  Plain Text (Copy)
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleExportCSV(record)}
                                  data-ocid={`history.export_csv.${rowNum}`}
                                >
                                  <Download className="w-4 h-4 mr-2" />
                                  CSV File (Excel/Sheets)
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-2"
                              onClick={() =>
                                handleViewRecord(record.recordIndex)
                              }
                              data-ocid={`history.view_button.${rowNum}`}
                            >
                              View Details
                              <ChevronRight className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Cards */}
            <div className="sm:hidden space-y-3">
              {filteredRecords.map((record, idx) => {
                const cats = [
                  ...new Set(record.entries.map((e) => e.category)),
                ];
                const cardNum = idx + 1;
                const within24h = isWithin24Hours(record.timestamp);
                const concernSaved = !!localStorage.getItem(
                  `concern_${record.recordIndex}`,
                );
                return (
                  <Card
                    key={record.recordIndex}
                    className="p-4"
                    data-ocid={`history.card.${cardNum}`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <span className="text-xs font-bold bg-gray-800 text-white rounded px-2 py-0.5">
                            Order #{record.orderNo}
                          </span>
                          <div className="font-semibold text-base text-foreground mt-1">
                            {formatDateDDMMYYYY(record.timestamp)}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {cats.join(" · ")}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {record.entries.length} ingredient
                        {record.entries.length !== 1 ? "s" : ""}
                      </div>
                      <Button
                        className={
                          within24h
                            ? "w-full gap-2 bg-red-600 hover:bg-red-700 text-white font-bold"
                            : "w-full gap-2 bg-gray-500 hover:bg-gray-600 text-white font-bold"
                        }
                        size="sm"
                        onClick={() => handleRaiseConcern(record.recordIndex)}
                        data-ocid={`history.concern_button.${cardNum}`}
                      >
                        <AlertTriangle className="w-4 h-4" />
                        {concernSaved ? "View Concern" : "Raised Concern"}
                      </Button>
                      <div className="flex items-center justify-between gap-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1"
                              data-ocid={`history.export_button.${cardNum}`}
                            >
                              <Download className="w-3.5 h-3.5" />
                              Export
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleCopyPlainText(record)}
                              data-ocid={`history.export_plaintext.${cardNum}`}
                            >
                              <FileText className="w-4 h-4 mr-2" />
                              Plain Text (Copy)
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleExportCSV(record)}
                              data-ocid={`history.export_csv.${cardNum}`}
                            >
                              <Download className="w-4 h-4 mr-2" />
                              CSV File (Excel/Sheets)
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewRecord(record.recordIndex)}
                          data-ocid={`history.view_button.${cardNum}`}
                        >
                          View
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </>
        ) : (
          <div className="text-center py-14" data-ocid="history.empty_state">
            <CalendarSearch className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-base font-semibold text-foreground mb-1">
              No Record Found
            </p>
            <p className="text-sm text-muted-foreground">
              No records found for the selected date range.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
