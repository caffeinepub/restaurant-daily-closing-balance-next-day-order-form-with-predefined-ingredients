import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft, Camera, CheckCircle, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import BackendConnectionErrorCard from "../components/BackendConnectionErrorCard";
import { useActorDiagnostics } from "../hooks/useActorDiagnostics";
import { useGetAllDailyRecords } from "../hooks/useQueries";
import type { ConcernRecord, ConcernStatus } from "../types/dailyForm";
import { formatDateDDMMYYYY } from "../utils/dateFormat";
import { exportConcernTableAsImage } from "../utils/exportTableAsImage";
import { isWithin24Hours, toMilliseconds } from "../utils/timestampUtils";

/** Statuses that cause red strikethrough on the entire row */
const STRIKETHROUGH_STATUSES: ConcernStatus[] = [
  "rejected",
  "spoiled",
  "expired",
  "damage",
];

export default function RaisedConcernPage() {
  const { recordId } = useParams({ from: "/history/$recordId/concern" });
  const { data: records, isLoading, error } = useGetAllDailyRecords();
  const { hasActorError, isActorLoading, retry } = useActorDiagnostics();
  const [isRetrying, setIsRetrying] = useState(false);
  const navigate = useNavigate();

  const recordIndexNum = Number(recordId);
  const record = records?.find((r) => r.recordIndex === recordIndexNum);

  // Items with nextDayOrder > 0 only
  const orderItems = record?.entries.filter((e) => e.nextDayOrder > 0) ?? [];

  const [statuses, setStatuses] = useState<ConcernStatus[]>([]);
  /** Received qty for "Short" rows — keyed by item index */
  const [receivedQtys, setReceivedQtys] = useState<Record<number, string>>({});

  // Load saved concern from localStorage when record becomes available
  useEffect(() => {
    if (!record) return;
    const items = record.entries.filter((e) => e.nextDayOrder > 0);
    const saved = localStorage.getItem(`concern_${recordId}`);
    if (saved) {
      try {
        const parsed: ConcernRecord = JSON.parse(saved);
        const loadedStatuses = items.map((item) => {
          const found = parsed.itemStatuses.find(
            (s) => s.itemName === item.name,
          );
          return (found?.status ?? "") as ConcernStatus;
        });
        const loadedQtys: Record<number, string> = {};
        items.forEach((item, idx) => {
          const found = parsed.itemStatuses.find(
            (s) => s.itemName === item.name,
          );
          if (found?.status === "short" && found.receivedQty !== undefined) {
            loadedQtys[idx] = String(found.receivedQty);
          }
        });
        setStatuses(loadedStatuses);
        setReceivedQtys(loadedQtys);
      } catch {
        setStatuses(items.map(() => ""));
      }
    } else {
      setStatuses(items.map(() => ""));
    }
  }, [record, recordId]);

  const isWithin24h = record ? isWithin24Hours(record.timestamp) : false;

  const allStatusSelected =
    statuses.length > 0 &&
    statuses.every((s, idx) => {
      if (s === "") return false;
      // For "short", require a valid received qty
      if (s === "short") {
        const v = receivedQtys[idx];
        return v !== undefined && v !== "" && !Number.isNaN(Number(v));
      }
      return true;
    });

  const handleStatusChange = (idx: number, value: ConcernStatus) => {
    setStatuses((prev) => {
      const next = [...prev];
      next[idx] = value;
      return next;
    });
    // Clear receivedQty when switching away from "short"
    if (value !== "short") {
      setReceivedQtys((prev) => {
        const next = { ...prev };
        delete next[idx];
        return next;
      });
    }
  };

  const handleReceivedQtyChange = (idx: number, value: string) => {
    setReceivedQtys((prev) => ({ ...prev, [idx]: value }));
  };

  const handleConfirm = () => {
    if (!record) return;
    const concernRecord: ConcernRecord = {
      recordIndex: record.recordIndex,
      restaurantName: record.restaurantName,
      timestamp: toMilliseconds(record.timestamp),
      itemStatuses: orderItems.map((item, idx) => {
        const status = statuses[idx];
        const base = {
          itemName: item.name,
          category: item.category,
          orderQty: item.nextDayOrder,
          status,
        };
        if (status === "short") {
          return { ...base, receivedQty: Number(receivedQtys[idx] ?? 0) };
        }
        return base;
      }),
      confirmedAt: Date.now(),
    };
    localStorage.setItem(`concern_${recordId}`, JSON.stringify(concernRecord));
    toast.success("Concern recorded successfully!");
    navigate({ to: "/history" });
  };

  const handleExportImage = () => {
    if (!record) return;
    const cats = [...new Set(record.entries.map((e) => e.category))];
    const recordMs = toMilliseconds(record.timestamp);
    exportConcernTableAsImage({
      orderNo: record.orderNo,
      restaurantName: record.restaurantName,
      orderDate: formatDateDDMMYYYY(BigInt(recordMs + 86400000)),
      categories: cats,
      totalIngredients: orderItems.length,
      items: orderItems.map((item, idx) => ({
        itemName: item.name,
        category: item.category,
        orderQty: item.nextDayOrder,
        status: statuses[idx] ?? "",
        receivedQty:
          statuses[idx] === "short"
            ? Number(receivedQtys[idx] ?? item.nextDayOrder)
            : undefined,
      })),
    });
    toast.success("Image exported!");
  };

  const handleRetry = () => {
    setIsRetrying(true);
    retry();
    setTimeout(() => setIsRetrying(false), 1500);
  };

  if (hasActorError) {
    return (
      <div className="max-w-3xl mx-auto">
        <BackendConnectionErrorCard
          onRetry={handleRetry}
          isRetrying={isRetrying}
          errorMessage="Failed to initialize backend connection."
        />
      </div>
    );
  }

  if (error && !isLoading && !isActorLoading) {
    return (
      <div className="max-w-3xl mx-auto">
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

  if (isLoading || isActorLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center space-y-3">
          <Loader2
            className="w-8 h-8 animate-spin text-muted-foreground mx-auto"
            data-ocid="concern.loading_state"
          />
          <p className="text-sm text-muted-foreground">Loading record...</p>
        </div>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">Record not found.</p>
            <Button
              variant="outline"
              onClick={() => navigate({ to: "/history" })}
            >
              Back to History
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const cats = [...new Set(record.entries.map((e) => e.category))];
  const recordMs = toMilliseconds(record.timestamp);

  return (
    <div className="max-w-3xl mx-auto space-y-4" data-ocid="concern.page">
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        className="gap-2"
        onClick={() => navigate({ to: "/history" })}
        data-ocid="concern.back.button"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to History
      </Button>

      {/* Order Info Box */}
      <Card className="border-2 border-gray-800">
        <CardHeader className="pb-2 pt-3 px-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold bg-gray-900 text-white rounded px-2 py-1">
                Order #{record.orderNo}
              </span>
              <CardTitle className="text-base">Raised Concern</CardTitle>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="gap-1 text-xs px-2 py-1 h-7"
              onClick={handleExportImage}
              data-ocid="concern.export.button"
            >
              <Camera className="w-3 h-3" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0 px-3 pb-3">
          <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-sm">
            <div>
              <span className="text-muted-foreground">Restaurant: </span>
              <span className="font-semibold">{record.restaurantName}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Order Date: </span>
              <span className="font-semibold">
                {formatDateDDMMYYYY(BigInt(recordMs + 86400000))}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Categories: </span>
              <span className="font-semibold">{cats.join(", ")}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Items: </span>
              <span className="font-semibold">{orderItems.length}</span>
            </div>
          </div>
          {!isWithin24h && (
            <div className="mt-2 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded px-2 py-1">
              ⚠️ Concern window has closed (24 hours passed). Read-only.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Items Table */}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <Table data-ocid="concern.table">
            <TableHeader>
              <TableRow>
                <TableHead className="pl-1 pr-0 py-2 text-xs">
                  Item Name
                </TableHead>
                <TableHead className="w-10 text-center py-2 text-xs pl-0">
                  Qty
                </TableHead>
                <TableHead className="w-32 text-center py-2 text-xs">
                  Status
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orderItems.map((item, idx) => {
                const status = statuses[idx] ?? "";
                const isStrikethrough = STRIKETHROUGH_STATUSES.includes(
                  status as ConcernStatus,
                );
                const isShort = status === "short";
                const rowNum = idx + 1;
                return (
                  <TableRow
                    key={item.name}
                    data-ocid={`concern.item.${rowNum}`}
                  >
                    {/* Item Name */}
                    <TableCell
                      className={`pl-1 pr-0 py-1.5 text-xs font-semibold ${
                        isStrikethrough ? "line-through text-red-500" : ""
                      }`}
                    >
                      {item.name}
                    </TableCell>

                    {/* Order Qty — editable input when Short */}
                    <TableCell className="text-center py-1.5 pl-0 w-10">
                      {isShort && isWithin24h ? (
                        <input
                          type="number"
                          inputMode="numeric"
                          value={receivedQtys[idx] ?? ""}
                          onChange={(e) =>
                            handleReceivedQtyChange(idx, e.target.value)
                          }
                          placeholder={String(item.nextDayOrder)}
                          className="w-14 text-xs text-center border-2 border-red-500 rounded px-1 py-0.5 outline-none focus:ring-1 focus:ring-red-400"
                          data-ocid={`concern.short_qty.${rowNum}`}
                        />
                      ) : (
                        <span
                          className={`text-xs ${
                            isStrikethrough ? "line-through text-red-500" : ""
                          }`}
                        >
                          {status === "short" && receivedQtys[idx]
                            ? receivedQtys[idx]
                            : item.nextDayOrder}
                        </span>
                      )}
                    </TableCell>

                    {/* Status dropdown / read-only */}
                    <TableCell className="text-center py-1.5 pr-1">
                      {isWithin24h ? (
                        <Select
                          value={status}
                          onValueChange={(v) =>
                            handleStatusChange(idx, v as ConcernStatus)
                          }
                        >
                          <SelectTrigger
                            className="w-[100px] mx-auto h-7 text-xs px-1"
                            data-ocid={`concern.select.${rowNum}`}
                          >
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="accepted">
                              ✅ Received
                            </SelectItem>
                            <SelectItem value="rejected">
                              ❌ Not Received
                            </SelectItem>
                            <SelectItem value="short">🟧 Short</SelectItem>
                            <SelectItem value="spoiled">🟥 Spoiled</SelectItem>
                            <SelectItem value="expired">⏰ Expired</SelectItem>
                            <SelectItem value="damage">🟨 Damage</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <span
                          className={`text-xs font-medium ${
                            status === "accepted"
                              ? "text-green-600"
                              : status === "short"
                                ? "text-orange-500"
                                : STRIKETHROUGH_STATUSES.includes(
                                      status as ConcernStatus,
                                    )
                                  ? "text-red-600"
                                  : "text-muted-foreground"
                          }`}
                        >
                          {status === "accepted"
                            ? "✅ Received"
                            : status === "rejected"
                              ? "❌ Not Received"
                              : status === "short"
                                ? "🟧 Short"
                                : status === "spoiled"
                                  ? "🟥 Spoiled"
                                  : status === "expired"
                                    ? "⏰ Expired"
                                    : status === "damage"
                                      ? "🟨 Damage"
                                      : "—"}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Confirm Button */}
      {isWithin24h && (
        <div className="pb-6">
          {!allStatusSelected && (
            <p className="text-xs text-muted-foreground text-center mb-2">
              {statuses.some(
                (s, idx) =>
                  s === "short" &&
                  (!receivedQtys[idx] ||
                    Number.isNaN(Number(receivedQtys[idx]))),
              )
                ? 'Please enter a received quantity for all "Short" rows.'
                : "Please select a status for every row to enable Confirm."}
            </p>
          )}
          <Button
            className="w-full gap-2 bg-gray-900 hover:bg-gray-800 text-white font-bold"
            disabled={!allStatusSelected}
            onClick={handleConfirm}
            data-ocid="concern.confirm.button"
          >
            <CheckCircle className="w-4 h-4" />
            Confirm Concern
          </Button>
        </div>
      )}
    </div>
  );
}
