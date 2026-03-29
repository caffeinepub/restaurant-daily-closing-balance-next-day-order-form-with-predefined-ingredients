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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart2, CalendarSearch, Download, Search } from "lucide-react";
import { Fragment, useEffect, useState } from "react";
import { toast } from "sonner";
import { useGetAllDailyRecords } from "../hooks/useQueries";
import type { SavedDailyRecord } from "../types/dailyForm";
import { getRawMaterials, getRestaurants } from "../utils/masterData";
import type { RawMaterial } from "../utils/masterData";

function getLocalDateString(ts: bigint): string {
  const ms = Number(ts);
  const d = new Date(ms);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatCompactDate(ts: bigint): string {
  const ms = Number(ts);
  const d = new Date(ms);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}`;
}

function getDateRange(fromDate: string, toDate: string): string[] {
  const dates: string[] = [];
  const start = new Date(fromDate);
  const end = new Date(toDate);
  const cur = new Date(start);
  while (cur <= end) {
    dates.push(
      `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, "0")}-${String(cur.getDate()).padStart(2, "0")}`,
    );
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
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

interface CategoryGroup {
  category: string;
  items: string[];
}

function groupRawMaterialsByCategory(
  materials: RawMaterial[],
): CategoryGroup[] {
  const map: Record<string, string[]> = {};
  for (const m of materials) {
    if (!map[m.category]) map[m.category] = [];
    map[m.category].push(m.name);
  }
  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([category, items]) => ({ category, items: items.sort() }));
}

function exportPivotCSV(
  records: SavedDailyRecord[],
  reportType: string,
  dates: string[],
  categoryGroups: CategoryGroup[],
) {
  const showBalance = reportType === "balance" || reportType === "both";
  const showOrder = reportType === "order" || reportType === "both";

  // Build a lookup: itemName -> dateKey -> {balance, order}
  const lookup: Record<
    string,
    Record<string, { balance: number; order: number }>
  > = {};
  for (const record of records) {
    const dk = getLocalDateString(record.timestamp);
    for (const entry of record.entries) {
      if (!lookup[entry.name]) lookup[entry.name] = {};
      lookup[entry.name][dk] = {
        balance: entry.closingBalance,
        order: entry.nextDayOrder,
      };
    }
  }

  // Header rows
  const headerRow1 = ["Item Name"];
  const headerRow2 = [""];
  for (const dk of dates) {
    const d = new Date(dk);
    const label = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (showBalance && showOrder) {
      headerRow1.push(label, "");
      headerRow2.push("Balance", "Order");
    } else if (showBalance) {
      headerRow1.push(label);
      headerRow2.push("Balance");
    } else {
      headerRow1.push(label);
      headerRow2.push("Order");
    }
  }

  const rows: string[][] = [headerRow1, headerRow2];

  for (const group of categoryGroups) {
    // Category header row
    const catRow = [`[${group.category}]`];
    for (
      let i = 0;
      i < dates.length * (showBalance && showOrder ? 2 : 1);
      i++
    ) {
      catRow.push("");
    }
    rows.push(catRow);

    for (const item of group.items) {
      const row = [item];
      for (const dk of dates) {
        const val = lookup[item]?.[dk];
        if (showBalance && showOrder) {
          row.push(val ? String(val.balance) : "—");
          row.push(val ? String(val.order) : "—");
        } else if (showBalance) {
          row.push(val ? String(val.balance) : "—");
        } else {
          row.push(val ? String(val.order) : "—");
        }
      }
      rows.push(row);
    }
  }

  const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `report-pivot-${reportType}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

interface ReportPanelProps {
  reportType: "order" | "balance" | "both";
  records: SavedDailyRecord[] | undefined;
  restaurants: string[];
  allRawMaterials: RawMaterial[];
}

function ReportPanel({
  reportType,
  records,
  restaurants,
  allRawMaterials,
}: ReportPanelProps) {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [restaurant, setRestaurant] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("__all__");
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

  // Build pivot data
  const dates =
    hasSearched && fromDate && toDate ? getDateRange(fromDate, toDate) : [];

  // Only include dates that have at least one record
  const datesWithData = dates.filter((dk) =>
    filteredRecords.some((r) => getLocalDateString(r.timestamp) === dk),
  );

  // Group all raw materials by category
  const categoryGroups = groupRawMaterialsByCategory(allRawMaterials);

  // Filter category groups based on selected category
  const visibleCategoryGroups =
    selectedCategory === "__all__"
      ? categoryGroups
      : categoryGroups.filter((g) => g.category === selectedCategory);

  // Build lookup: itemName -> dateKey -> {balance, order}
  const lookup: Record<
    string,
    Record<string, { balance: number; order: number }>
  > = {};
  for (const record of filteredRecords) {
    const dk = getLocalDateString(record.timestamp);
    for (const entry of record.entries) {
      if (!lookup[entry.name]) lookup[entry.name] = {};
      lookup[entry.name][dk] = {
        balance: entry.closingBalance,
        order: entry.nextDayOrder,
      };
    }
  }

  // Build compact date label map for display
  const dateLabelMap: Record<string, string> = {};
  for (const dk of datesWithData) {
    const d = new Date(dk);
    const ts = BigInt(d.getTime());
    dateLabelMap[dk] = formatCompactDate(ts);
  }

  const subColCount = showBalance && showOrder ? 2 : 1;
  const totalDataCols = datesWithData.length * subColCount;
  const totalItemCount = visibleCategoryGroups.reduce(
    (sum, g) => sum + g.items.length,
    0,
  );

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
        <div className="flex flex-col gap-1">
          <Label className="text-xs font-semibold">Category</Label>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-44" data-ocid="reports.category.select">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All Categories</SelectItem>
              {categoryGroups.map((g) => (
                <SelectItem key={g.category} value={g.category}>
                  {g.category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          onClick={handleSearch}
          className="gap-2 bg-gray-900 hover:bg-gray-800 text-white font-bold"
          data-ocid="reports.search_button"
        >
          <Search className="w-4 h-4" />
          Search
        </Button>
        {hasSearched && filteredRecords.length > 0 && (
          <Button
            variant="outline"
            className="gap-2"
            onClick={() =>
              exportPivotCSV(
                filteredRecords,
                reportType,
                datesWithData,
                visibleCategoryGroups,
              )
            }
            data-ocid="reports.export_button"
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
      ) : filteredRecords.length === 0 ? (
        <div className="text-center py-14">
          <CalendarSearch className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-base font-semibold">No records found</p>
          <p className="text-sm text-muted-foreground">
            No data for the selected restaurant and date range.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <p className="text-xs text-muted-foreground px-3 pt-2 pb-1">
            {totalItemCount} item{totalItemCount !== 1 ? "s" : ""} across{" "}
            {datesWithData.length} date{datesWithData.length !== 1 ? "s" : ""}{" "}
            for <span className="font-semibold">{restaurant}</span>
            {selectedCategory !== "__all__" && (
              <span>
                {" "}
                — category:{" "}
                <span className="font-semibold">{selectedCategory}</span>
              </span>
            )}
          </p>
          <table
            className="w-full text-sm border-collapse"
            style={{ minWidth: `${200 + totalDataCols * 70}px` }}
          >
            <thead>
              {/* Row 1: Item Name + date headers spanning sub-cols */}
              <tr className="bg-muted/80">
                <th
                  className="text-left px-3 py-2 font-semibold border-r border-b border-border"
                  style={{
                    position: "sticky",
                    left: 0,
                    background: "#f3f4f6",
                    zIndex: 2,
                    minWidth: 160,
                  }}
                  rowSpan={2}
                >
                  Item Name
                </th>
                {datesWithData.map((dk) => (
                  <th
                    key={dk}
                    colSpan={subColCount}
                    className="text-center px-2 py-1.5 font-semibold border-r border-b border-border text-xs"
                    style={{ minWidth: subColCount === 2 ? 120 : 70 }}
                  >
                    {dateLabelMap[dk]}
                  </th>
                ))}
              </tr>
              {/* Row 2: sub-column labels */}
              <tr className="bg-muted/50">
                {datesWithData.map((dk) => (
                  <Fragment key={dk}>
                    {showBalance && (
                      <th
                        className="text-center px-1 py-1 text-xs font-medium border-r border-b border-border text-muted-foreground"
                        style={{ minWidth: 55 }}
                      >
                        Bal
                      </th>
                    )}
                    {showOrder && (
                      <th
                        className="text-center px-1 py-1 text-xs font-medium border-r border-b border-border text-muted-foreground"
                        style={{ minWidth: 55 }}
                      >
                        Ord
                      </th>
                    )}
                  </Fragment>
                ))}
              </tr>
            </thead>
            <tbody>
              {visibleCategoryGroups.map((group) => (
                <Fragment key={group.category}>
                  {/* Category header row */}
                  <tr className="bg-orange-50 border-t-2 border-orange-200">
                    <td
                      className="px-3 py-1.5 font-bold text-xs text-orange-800 border-r border-border uppercase tracking-wide"
                      style={{
                        position: "sticky",
                        left: 0,
                        background: "#fff7ed",
                        zIndex: 1,
                        minWidth: 160,
                      }}
                      colSpan={1}
                    >
                      {group.category}
                    </td>
                    {datesWithData.map((dk) => (
                      <Fragment key={dk}>
                        {showBalance && (
                          <td className="border-r border-border bg-orange-50" />
                        )}
                        {showOrder && (
                          <td className="border-r border-border bg-orange-50" />
                        )}
                      </Fragment>
                    ))}
                  </tr>
                  {/* Item rows */}
                  {group.items.map((item, idx) => (
                    <tr
                      key={item}
                      className={idx % 2 === 0 ? "bg-white" : "bg-muted/20"}
                    >
                      <td
                        className="px-3 py-1.5 font-medium border-r border-border text-xs pl-5"
                        style={{
                          position: "sticky",
                          left: 0,
                          background: idx % 2 === 0 ? "white" : "#f9f9f9",
                          zIndex: 1,
                          minWidth: 160,
                        }}
                      >
                        {item}
                      </td>
                      {datesWithData.map((dk) => {
                        const val = lookup[item]?.[dk];
                        return (
                          <Fragment key={dk}>
                            {showBalance && (
                              <td className="text-center px-1 py-1.5 font-mono text-xs border-r border-border">
                                {val && val.balance > 0 ? val.balance : "—"}
                              </td>
                            )}
                            {showOrder && (
                              <td className="text-center px-1 py-1.5 font-mono text-xs border-r border-border">
                                {val && val.order > 0 ? val.order : "—"}
                              </td>
                            )}
                          </Fragment>
                        );
                      })}
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function AdminReportsTab() {
  const { data: records, isLoading } = useGetAllDailyRecords();
  const [restaurants, setRestaurants] = useState<string[]>([]);
  const [loadingRestaurants, setLoadingRestaurants] = useState(true);
  const [allRawMaterials, setAllRawMaterials] = useState<RawMaterial[]>([]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: run once on mount
  useEffect(() => {
    Promise.all([
      getRestaurants().then((rests) => rests.map((r) => r.name).sort()),
      getRawMaterials(),
    ])
      .then(([names, materials]) => {
        setRestaurants(names);
        setAllRawMaterials(materials);
      })
      .catch(() => {
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
          Date-wise pivot table: rows = items grouped by category, columns =
          dates. Select a restaurant and date range, then tap Search.
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
            allRawMaterials={allRawMaterials}
          />
        </TabsContent>
        <TabsContent value="balance">
          <ReportPanel
            reportType="balance"
            records={records}
            restaurants={restaurants}
            allRawMaterials={allRawMaterials}
          />
        </TabsContent>
        <TabsContent value="both">
          <ReportPanel
            reportType="both"
            records={records}
            restaurants={restaurants}
            allRawMaterials={allRawMaterials}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
