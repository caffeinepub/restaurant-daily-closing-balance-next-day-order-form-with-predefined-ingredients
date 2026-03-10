import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getCategoryInputBgColor } from "@/utils/categoryColors";

interface IngredientData {
  name: string;
  category: string;
  closingBalance: string;
  nextDayOrder: string;
}

interface DailyEntryIngredientRowMobileProps {
  ingredient: IngredientData;
  onBalanceChange: (value: string) => void;
  onOrderChange: (value: string) => void;
}

export default function DailyEntryIngredientRowMobile({
  ingredient,
  onBalanceChange,
  onOrderChange,
}: DailyEntryIngredientRowMobileProps) {
  return (
    <Card className="p-4 space-y-3">
      <div className="font-semibold text-base text-foreground">
        {ingredient.name}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label
            htmlFor={`balance-${ingredient.name}`}
            className="text-sm font-medium"
          >
            Balance
          </Label>
          <Input
            id={`balance-${ingredient.name}`}
            type="number"
            placeholder="0"
            min="0"
            step="0.01"
            value={ingredient.closingBalance}
            onChange={(e) => onBalanceChange(e.target.value)}
            className={`h-10 w-full ${getCategoryInputBgColor(ingredient.category)}`}
          />
        </div>
        <div className="space-y-1.5">
          <Label
            htmlFor={`order-${ingredient.name}`}
            className="text-sm font-medium"
          >
            Order
          </Label>
          <Input
            id={`order-${ingredient.name}`}
            type="number"
            placeholder="0"
            min="0"
            step="0.01"
            value={ingredient.nextDayOrder}
            onChange={(e) => onOrderChange(e.target.value)}
            className={`h-10 w-full ${getCategoryInputBgColor(ingredient.category)}`}
          />
        </div>
      </div>
    </Card>
  );
}
