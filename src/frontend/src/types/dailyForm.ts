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

/**
 * Frontend concern status values.
 * 'received' maps to backend ConcernStatus.received
 * 'notReceived' maps to backend ConcernStatus.notReceived
 * Legacy UI names 'accepted'/'rejected' are kept for backward-compat with localStorage data.
 */
export type ConcernStatus =
  | "received"
  | "notReceived"
  | "accepted" // legacy alias for 'received' (localStorage compat)
  | "rejected" // legacy alias for 'notReceived' (localStorage compat)
  | "spoiled"
  | "expired"
  | "damage"
  | "short"
  | "";

export interface ConcernItemStatus {
  itemName: string;
  category: string;
  orderQty: number;
  status: ConcernStatus;
  /** Populated only when status === 'short' — the quantity actually received */
  receivedQty?: number;
}

export interface ConcernRecord {
  recordIndex: number;
  restaurantName: string;
  timestamp: number;
  itemStatuses: ConcernItemStatus[];
  /** Unix ms when concern was confirmed — 0 means not yet confirmed */
  confirmedAt: number;
  /** Username of the person who confirmed */
  confirmedBy: string;
}
