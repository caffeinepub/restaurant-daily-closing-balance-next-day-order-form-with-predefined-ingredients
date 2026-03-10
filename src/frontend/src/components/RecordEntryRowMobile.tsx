import { Card } from "@/components/ui/card";

interface RecordEntryRowMobileProps {
  name: string;
  balance: number;
  order: number;
}

export default function RecordEntryRowMobile({
  name,
  balance,
  order,
}: RecordEntryRowMobileProps) {
  return (
    <Card className="p-4">
      <div className="space-y-2">
        <div className="font-semibold text-base text-foreground">{name}</div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-muted-foreground mb-1">Balance</div>
            <div className="font-medium">{balance}</div>
          </div>
          <div>
            <div className="text-muted-foreground mb-1">Order</div>
            <div className="font-medium">{order}</div>
          </div>
        </div>
      </div>
    </Card>
  );
}
