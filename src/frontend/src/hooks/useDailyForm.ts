import { useCallback, useState } from "react";
import { PREDEFINED_INGREDIENTS } from "../data/predefinedIngredients";
import type {
  IngredientEntryData,
  IngredientFormData,
} from "../types/dailyForm";

export function useDailyForm() {
  const [formData, setFormData] = useState<IngredientFormData[]>(() =>
    PREDEFINED_INGREDIENTS.map((ing) => ({
      name: ing.name,
      category: ing.category,
      closingBalance: "",
      nextDayOrder: "",
    })),
  );

  const updateIngredient = useCallback(
    (index: number, field: keyof IngredientFormData, value: string) => {
      setFormData((prev) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], [field]: value };
        return updated;
      });
    },
    [],
  );

  const validateAndPrepare = useCallback((): IngredientEntryData[] => {
    const entries: IngredientEntryData[] = [];

    for (const item of formData) {
      // Default empty numeric values to 0
      const closingBalance = item.closingBalance
        ? Number.parseFloat(item.closingBalance)
        : 0;
      const nextDayOrder = item.nextDayOrder
        ? Number.parseFloat(item.nextDayOrder)
        : 0;

      // Skip only if values are invalid or negative
      if (
        Number.isNaN(closingBalance) ||
        Number.isNaN(nextDayOrder) ||
        closingBalance < 0 ||
        nextDayOrder < 0
      ) {
        continue; // Skip invalid entries
      }

      // Include all ingredients, even with 0 values
      entries.push({
        name: item.name,
        category: item.category,
        closingBalance,
        nextDayOrder,
      });
    }

    return entries;
  }, [formData]);

  const reset = useCallback(() => {
    setFormData(
      PREDEFINED_INGREDIENTS.map((ing) => ({
        name: ing.name,
        category: ing.category,
        closingBalance: "",
        nextDayOrder: "",
      })),
    );
  }, []);

  return {
    formData,
    updateIngredient,
    validateAndPrepare,
    reset,
  };
}
