import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart2, CalendarSearch, Download, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useGetAllDailyRecords } from "../hooks/useQueries";
import type { IngredientEntryData, SavedDailyRecord } from "../types/dailyForm";
import { getRestaurants } from "../utils/masterData";

function getLocalDateString(ts: bigint): string {
  const ms = Number(ts);
  const d = new Date(ms);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatDate(ts: bigint): string {
  const ms = Number(ts);
  const d = new Date(ms);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

function filterByDateAndRestaurant(
  records: SavedDailyRecord[],
  fromDate: string,
  toDate: string,
  restaurant: string,
): SavedDailyRecord[] {
  return records.filter((r) => {
    if (r.restaurantName !== restaurant) return false;
    if (fromDate || toDate) {
      const ds = getLocalDateString(r.timestamp);
      if (fromDate && ds < fromDate) return false;
      if (toDate && ds > toDate) return false;
    }
    return true;
  });
}

function exportReportCSV(records: SavedDailyRecord[], reportType: string) {
  const showBalance = reportType === "balance" || reportType === "both";
  const showOrder = reportType === "order" || reportType === "both";

  const headers = [
    "Order No.",
    "Restaurant",
    "Balance Date",
    "Category",
    "Item Name",
  ];
  if (showBalance) headers.push("Closing Balance");
  if (showOrder) headers.push("Order Qty");

  const rows: string[][] = [];
  for (const record of records) {
    for (const entry of record.entries) {
      const row = [
        `#${record.orderNo}`,
        record.restaurantName,
        formatDate(record.timestamp),
        entry.category,
        entry.name,
      ];
      if (showBalance) row.push(String(entry.closingBalance));
      if (showOrder) row.push(String(entry.nextDayOrder));
      rows.push(row);
    }
  }

  const csv = [headers, ...rows]
    .map((r) => r.map((c) => `"${c}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `report-${reportType}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

interface ReportPanelProps {
  reportType: "order" | "balance" | "both";
  records: SavedDailyRecord[] | undefined;
  restaurants: string[];
}

function ReportPanel({ reportType, records, restaurants }: ReportPanelProps) {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [restaurant, setRestaurant] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [filteredRecords, setFilteredRecords] = useState<SavedDailyRecord[]>(
    [],
  );

  const showBalance = reportType === "balance" || reportType === "both";
  const showOrder = reportType === "order" || reportType === "both";

  const handleSearch = () => {
    if (!restaurant) {
      toast.error("Please select a restaurant.");
      return;
    }
    if (!fromDate || !toDate) {
      toast.error("Please select both From Date and To Date.");
      return;
    }
    const result = filterByDateAndRestaurant(
      records ?? [],
      fromDate,
      toDate,
      restaurant,
    );
    setFilteredRecords(result);
    setHasSearched(true);
  };

  // Flatten entries for table display
  const rows: Array<{
    orderNo: number;
    restaurantName: string;
    date: string;
    entry: IngredientEntryData;
  }> = [];
  for (const record of filteredRecords) {
    for (const entry of record.entries) {
      rows.push({
        orderNo: record.orderNo,
        restaurantName: record.restaurantName,
        date: formatDate(record.timestamp),
        entry,
      });
    }
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-end p-3 bg-muted rounded-lg">
        <div className="flex flex-col gap-1">
          <Label className="text-xs font-semibold">
            Restaurant <span className="text-red-500">*</span>
          </Label>
          <Select value={restaurant} onValueChange={setRestaurant}>
            <SelectTrigger className="w-52">
              <SelectValue placeholder="Select Restaurant" />
            </SelectTrigger>
            <SelectContent>
              {restaurants.length === 0 ? (
                <SelectItem value="__none__" disabled>
                  No restaurants found
                </SelectItem>
              ) : (
                restaurants.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1">
          <Label className="text-xs font-semibold">From Date</Label>
          <Input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="w-40"
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label className="text-xs font-semibold">To Date</Label>
          <Input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="w-40"
          />
        </div>
        <Button
          onClick={handleSearch}
          className="gap-2 bg-gray-900 hover:bg-gray-800 text-white font-bold"
        >
          <Search className="w-4 h-4" />
          Search
        </Button>
        {hasSearched && filteredRecords.length > 0 && (
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => exportReportCSV(filteredRecords, reportType)}
          >
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        )}
      </div>

      {/* Results */}
      {!hasSearched ? (
        <div className="text-center py-14">
          <CalendarSearch className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-base font-semibold text-foreground mb-1">
            Select a restaurant and date range
          </p>
          <p className="text-sm text-muted-foreground">
            Choose a restaurant, set a date range, and tap Search.
          </p>
        </div>
      ) : rows.length === 0 ? (
        <div className="text-center py-14">
          <CalendarSearch className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-base font-semibold">No records found</p>
          <p className="text-sm text-muted-foreground">
            No data for the selected restaurant and date range.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <p className="text-xs text-muted-foreground mb-2">
            {rows.length} item entr{rows.length !== 1 ? "ies" : "y"} across{" "}
            {filteredRecords.length} order
            {filteredRecords.length !== 1 ? "s" : ""} for{" "}
            <span className="font-semibold">{restaurant}</span>
          </p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Order No.</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Item Name</TableHead>
                {showBalance && (
                  <TableHead className="text-right">Closing Balance</TableHead>
                )}
                {showOrder && (
                  <TableHead className="text-right">Order Qty</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row, i) => (
                <TableRow key={`${row.orderNo}-${i}-${row.entry.name}`}>
                  <TableCell className="font-bold text-center">
                    #{row.orderNo}
                  </TableCell>
                  <TableCell>{row.date}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {row.entry.category}
                  </TableCell>
                  <TableCell>{row.entry.name}</TableCell>
                  {showBalance && (
                    <TableCell className="text-right font-mono">
                      {row.entry.closingBalance > 0
                        ? row.entry.closingBalance
                        : "—"}
                    </TableCell>
                  )}
                  {showOrder && (
                    <TableCell className="text-right font-mono">
                      {row.entry.nextDayOrder > 0
                        ? row.entry.nextDayOrder
                        : "—"}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

export default function AdminReportsTab() {
  const { data: records, isLoading } = useGetAllDailyRecords();
  const [restaurants, setRestaurants] = useState<string[]>([]);
  const [loadingRestaurants, setLoadingRestaurants] = useState(true);

  // biome-ignore lint/correctness/useExhaustiveDependencies: run once on mount
  useEffect(() => {
    getRestaurants()
      .then((rests) => {
        const names = rests.map((r) => r.name).sort();
        setRestaurants(names);
      })
      .catch(() => {
        // fallback: derive from records
        if (records) {
          const unique = [
            ...new Set(records.map((r) => r.restaurantName)),
          ].sort();
          setRestaurants(unique);
        }
      })
      .finally(() => setLoadingRestaurants(false));
  }, []);

  if (isLoading || loadingRestaurants) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center space-y-3">
          <BarChart2 className="w-10 h-10 text-muted-foreground mx-auto animate-pulse" />
          <p className="text-sm text-muted-foreground">Loading records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Reports</h3>
        <p className="text-sm text-muted-foreground">
          Select a restaurant, choose a date range, and tap Search.
        </p>
      </div>

      <Tabs defaultValue="order">
        <TabsList className="mb-4">
          <TabsTrigger value="order">By Order</TabsTrigger>
          <TabsTrigger value="balance">By Balance</TabsTrigger>
          <TabsTrigger value="both">Balance &amp; Order</TabsTrigger>
        </TabsList>

        <TabsContent value="order">
          <ReportPanel
            reportType="order"
            records={records}
            restaurants={restaurants}
          />
        </TabsContent>
        <TabsContent value="balance">
          <ReportPanel
            reportType="balance"
            records={records}
            restaurants={restaurants}
          />
        </TabsContent>
        <TabsContent value="both">
          <ReportPanel
            reportType="both"
            records={records}
            restaurants={restaurants}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
