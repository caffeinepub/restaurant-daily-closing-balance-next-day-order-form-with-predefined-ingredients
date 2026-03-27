import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { History, Warehouse } from "lucide-react";
import DailyEntryForm from "../components/DailyEntryForm";
import HistoryContent from "../components/HistoryContent";

const STORE_CATEGORIES = [
  "Dry Store",
  "Housekeeping",
  "Beverages",
  "Disposable",
];

export default function StoreIndentsPage() {
  return (
    <Tabs defaultValue="entry" className="w-full">
      <TabsList className="w-full mb-4">
        <TabsTrigger
          value="entry"
          className="flex-1 gap-1.5"
          style={{ background: "#E8F5E9", color: "#2e7d32", fontWeight: 600 }}
        >
          <Warehouse className="w-4 h-4" />
          Entry
        </TabsTrigger>
        <TabsTrigger
          value="history"
          className="flex-1 gap-1.5"
          style={{ background: "#E3F2FD", color: "#1565c0", fontWeight: 600 }}
        >
          <History className="w-4 h-4" />
          History
        </TabsTrigger>
      </TabsList>
      <TabsContent value="entry">
        <DailyEntryForm
          title="Store Indents"
          categoryFilter={STORE_CATEGORIES}
          ocidPrefix="store"
        />
      </TabsContent>
      <TabsContent value="history">
        <HistoryContent title="Store Indents History" />
      </TabsContent>
    </Tabs>
  );
}
