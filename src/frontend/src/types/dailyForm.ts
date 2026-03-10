export interface IngredientFormData {
  name: string;
  category: string;
  closingBalance: string;
  nextDayOrder: string;
}

export interface DailyFormState {
  ingredients: IngredientFormData[];
}

export interface IngredientEntryData {
  name: string;
  category: string;
  closingBalance: number;
  nextDayOrder: number;
}

export interface SavedDailyRecord {
  entries: IngredientEntryData[];
  timestamp: bigint;
  restaurantName: string;
  /** Zero-based index in the user's records array — used as a stable unique ID */
  recordIndex: number;
  /** 1-based order number shown in the UI */
  orderNo: number;
}
