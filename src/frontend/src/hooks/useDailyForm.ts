import { useState, useCallback } from 'react';
import { PREDEFINED_INGREDIENTS } from '../data/predefinedIngredients';
import type { IngredientFormData, IngredientEntryData } from '../types/dailyForm';

export function useDailyForm() {
  const [formData, setFormData] = useState<IngredientFormData[]>(() =>
    PREDEFINED_INGREDIENTS.map((ing) => ({
      name: ing.name,
      category: ing.category,
      unit: '',
      closingBalance: '',
      nextDayOrder: '',
    }))
  );

  const updateIngredient = useCallback((index: number, field: keyof IngredientFormData, value: string) => {
    setFormData((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }, []);

  const validateAndPrepare = useCallback((): IngredientEntryData[] => {
    const entries: IngredientEntryData[] = [];

    for (const item of formData) {
      // Skip completely empty rows
      if (!item.unit && !item.closingBalance && !item.nextDayOrder) {
        continue;
      }

      // Default empty numeric values to 0
      const closingBalance = item.closingBalance ? parseFloat(item.closingBalance) : 0;
      const nextDayOrder = item.nextDayOrder ? parseFloat(item.nextDayOrder) : 0;

      // Only validate that numbers are valid and non-negative if provided
      if (isNaN(closingBalance) || isNaN(nextDayOrder) || closingBalance < 0 || nextDayOrder < 0) {
        continue; // Skip invalid entries
      }

      entries.push({
        name: item.name,
        category: item.category,
        unit: item.unit || '',
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
        unit: '',
        closingBalance: '',
        nextDayOrder: '',
      }))
    );
  }, []);

  return {
    formData,
    updateIngredient,
    validateAndPrepare,
    reset,
  };
}
