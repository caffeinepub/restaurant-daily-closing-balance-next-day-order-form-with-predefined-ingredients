import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useNavigate } from "@tanstack/react-router";
import { ChevronRight, FileText, Loader2 } from "lucide-react";
import { useState } from "react";
import BackendConnectionErrorCard from "../components/BackendConnectionErrorCard";
import { useActorDiagnostics } from "../hooks/useActorDiagnostics";
import { useGetAllDailyRecords } from "../hooks/useQueries";
import { formatDateDDMMYYYY } from "../utils/dateFormat";

export default function HistoryPage() {
  const { data: records, isLoading, error } = useGetAllDailyRecords();
  const { hasActorError, isActorLoading, retry } = useActorDiagnostics();
  const [isRetrying, setIsRetrying] = useState(false);
  const navigate = useNavigate();

  const handleViewRecord = (recordIndex: number) => {
    // Use the array index as the stable unique record identifier
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
            error instanceof Error ? error.message : "Failed to load records"
          }
        />
      </div>
    );
  }

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
          {isLoading || isActorLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground mx-auto" />
                <p className="text-sm text-muted-foreground">
                  Loading records...
                </p>
              </div>
            </div>
          ) : records && records.length > 0 ? (
            <>
              {/* Desktop Table View - hidden on mobile */}
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
                    {records.map((record) => {
                      const cats = [
                        ...new Set(record.entries.map((e) => e.category)),
                      ];
                      return (
                        <TableRow
                          key={record.recordIndex}
                          data-ocid={`history.row.${record.recordIndex + 1}`}
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
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-2"
                              onClick={() =>
                                handleViewRecord(record.recordIndex)
                              }
                              data-ocid={`history.view_button.${record.recordIndex + 1}`}
                            >
                              View Details
                              <ChevronRight className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View - visible only on mobile */}
              <div className="sm:hidden space-y-3">
                {records.map((record) => {
                  const cats = [
                    ...new Set(record.entries.map((e) => e.category)),
                  ];
                  return (
                    <Card
                      key={record.recordIndex}
                      className="p-4"
                      data-ocid={`history.card.${record.recordIndex + 1}`}
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
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            {record.entries.length} ingredient
                            {record.entries.length !== 1 ? "s" : ""}
                          </span>
                          <Button
                            variant="default"
                            size="sm"
                            className="gap-2"
                            onClick={() => handleViewRecord(record.recordIndex)}
                            data-ocid={`history.mobile_view_button.${record.recordIndex + 1}`}
                          >
                            View Details
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-2">No records found</p>
              <p className="text-sm text-muted-foreground">
                Start by creating your first daily entry
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
