export interface IngredientFormData {
  name: string;
  category: string;
  unit: string;
  closingBalance: string;
  nextDayOrder: string;
}

export interface DailyFormState {
  ingredients: IngredientFormData[];
}

export interface IngredientEntryData {
  name: string;
  category: string;
  unit: string;
  closingBalance: number;
  nextDayOrder: number;
}

export interface SavedDailyRecord {
  entries: IngredientEntryData[];
  timestamp: bigint;
}
