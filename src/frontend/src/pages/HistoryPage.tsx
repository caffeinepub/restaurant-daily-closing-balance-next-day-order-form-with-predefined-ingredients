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
  ChevronRight,
  Download,
  FileText,
  Loader2,
  LogIn,
  Search,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import BackendConnectionErrorCard from "../components/BackendConnectionErrorCard";
import { useActorDiagnostics } from "../hooks/useActorDiagnostics";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetAllDailyRecords } from "../hooks/useQueries";
import type { SavedDailyRecord } from "../types/dailyForm";
import { exportRecordToCSV } from "../utils/csvExport";
import { formatDateDDMMYYYY } from "../utils/dateFormat";
import { formatRecordAsPlainText } from "../utils/recordPlainText";

function getLocalDateString(ts: bigint): string {
  const ms = Number(ts / 1_000_000n);
  const d = new Date(ms);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function filterRecords(
  records: SavedDailyRecord[],
  searchText: string,
  fromDate: string,
  toDate: string,
): SavedDailyRecord[] {
  return records.filter((r) => {
    if (searchText) {
      const q = searchText.toLowerCase();
      const matchRestaurant = r.restaurantName.toLowerCase().includes(q);
      const matchDate = formatDateDDMMYYYY(r.timestamp).includes(q);
      const matchOrder = String(r.orderNo).includes(q);
      const matchIngredient = r.entries.some((e) =>
        e.name.toLowerCase().includes(q),
      );
      if (!matchRestaurant && !matchDate && !matchOrder && !matchIngredient)
        return false;
    }
    if (fromDate || toDate) {
      const ds = getLocalDateString(r.timestamp);
      if (fromDate && ds < fromDate) return false;
      if (toDate && ds > toDate) return false;
    }
    return true;
  });
}

export default function HistoryPage() {
  const { data: records, isLoading, error } = useGetAllDailyRecords();
  const { hasActorError, isActorLoading, retry } = useActorDiagnostics();
  const { identity, login, loginStatus } = useInternetIdentity();
  const [isRetrying, setIsRetrying] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [appliedFromDate, setAppliedFromDate] = useState("");
  const [appliedToDate, setAppliedToDate] = useState("");
  const navigate = useNavigate();

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();
  const isLoggingIn = loginStatus === "logging-in";

  const handleViewRecord = (recordIndex: number) => {
    navigate({
      to: "/history/$recordId",
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
  };

  const clearFilters = () => {
    setSearchText("");
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

  const hasActiveFilters = !!searchText;

  if (!isAuthenticated && !isActorLoading) {
    return (
      <div className="max-w-7xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Saved Records</CardTitle>
            <CardDescription>
              View and export your previously saved daily records
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12" data-ocid="history.empty_state">
              <LogIn className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-base font-semibold mb-2">
                Sign in to view history
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                You need to sign in with Internet Identity to access saved
                records.
              </p>
              <Button
                onClick={login}
                disabled={isLoggingIn}
                className="gap-2"
                data-ocid="history.sign_in_button"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    Sign In
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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

  if (error && !isLoading && !isActorLoading) {
    return (
      <div className="max-w-7xl mx-auto">
        <BackendConnectionErrorCard
          onRetry={handleRetry}
          isRetrying={isRetrying}
          errorMessage={
            error instanceof Error ? error.message : "Failed to load records"
          }
        />
      </div>
    );
  }

  const filteredRecords = records
    ? filterRecords(records, searchText, appliedFromDate, appliedToDate)
    : [];

  const totalRecords = records?.length ?? 0;

  return (
    <div className="max-w-7xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Saved Records</CardTitle>
          <CardDescription>
            {totalRecords > 0
              ? `${totalRecords} total record${totalRecords !== 1 ? "s" : ""} — use search or date range to filter`
              : "View and export your previously saved daily records"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search & Filter Section */}
          <div className="mb-5 space-y-3" data-ocid="history.filter.panel">
            {/* Search Box */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by restaurant, date, order no., or ingredient..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="pl-9 pr-9"
                data-ocid="history.search_input"
              />
              {searchText && (
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setSearchText("")}
                  data-ocid="history.clear_search.button"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Custom Date Range */}
            <div
              className="flex flex-wrap gap-3 items-end p-3 bg-muted rounded-lg"
              data-ocid="history.custom.panel"
            >
              <div className="flex flex-col gap-1">
                <Label htmlFor="from-date" className="text-xs font-semibold">
                  From Date
                </Label>
                <Input
                  id="from-date"
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-40"
                  data-ocid="history.from.input"
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="to-date" className="text-xs font-semibold">
                  To Date
                </Label>
                <Input
                  id="to-date"
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
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="gap-1"
                  data-ocid="history.clear.button"
                >
                  <X className="w-3 h-3" />
                  Clear All
                </Button>
              )}
            </div>
          </div>

          {isLoading || isActorLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground mx-auto" />
                <p className="text-sm text-muted-foreground">
                  Loading records...
                </p>
              </div>
            </div>
          ) : filteredRecords.length > 0 ? (
            <>
              <p className="text-xs text-muted-foreground mb-3">
                Showing {filteredRecords.length} of {totalRecords} record
                {totalRecords !== 1 ? "s" : ""}
              </p>

              {/* Desktop Table View */}
              <div className="hidden sm:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[70px]">Order No.</TableHead>
                      <TableHead>Restaurant</TableHead>
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
                      return (
                        <TableRow
                          key={record.recordIndex}
                          data-ocid={`history.row.${rowNum}`}
                        >
                          <TableCell className="font-bold text-base text-center">
                            #{record.orderNo}
                          </TableCell>
                          <TableCell className="font-medium">
                            {record.restaurantName}
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
                            <div className="flex items-center justify-end gap-1">
                              {/* Export Dropdown */}
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

              {/* Mobile Card View */}
              <div className="sm:hidden space-y-3">
                {filteredRecords.map((record, idx) => {
                  const cats = [
                    ...new Set(record.entries.map((e) => e.category)),
                  ];
                  const cardNum = idx + 1;
                  return (
                    <Card
                      key={record.recordIndex}
                      className="p-4"
                      data-ocid={`history.card.${cardNum}`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold bg-gray-800 text-white rounded px-2 py-0.5">
                                Order #{record.orderNo}
                              </span>
                            </div>
                            <div className="font-semibold text-base text-foreground mt-1">
                              {record.restaurantName}
                            </div>
                            <div className="text-sm text-muted-foreground mt-0.5">
                              {formatDateDDMMYYYY(record.timestamp)}
                            </div>
                            <div className="text-xs text-muted-foreground mt-0.5">
                              {cats.join(" · ")}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm text-muted-foreground">
                            {record.entries.length} ingredient
                            {record.entries.length !== 1 ? "s" : ""}
                          </span>
                          <div className="flex gap-2">
                            {/* Mobile Export Dropdown */}
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
                              variant="default"
                              size="sm"
                              className="gap-2"
                              onClick={() =>
                                handleViewRecord(record.recordIndex)
                              }
                              data-ocid={`history.mobile_view_button.${cardNum}`}
                            >
                              View
                              <ChevronRight className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="text-center py-12" data-ocid="history.empty_state">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {hasActiveFilters
                  ? "No records match your search or date range"
                  : "No records saved yet"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
