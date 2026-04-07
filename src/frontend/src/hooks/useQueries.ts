import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  ConcernItemStatus as BackendConcernItemStatus,
  ConcernRecord as BackendConcernRecord,
  DailyRecord,
  Meal,
} from "../backend";
import { ConcernStatus as BackendConcernStatusEnum } from "../backend";
import type {
  ConcernItemStatus,
  ConcernRecord,
  ConcernStatus,
  IngredientEntryData,
  SavedDailyRecord,
} from "../types/dailyForm";
import { extractActorError } from "../utils/actorError";
import { getAnonActor, getFreshActor } from "../utils/backendClient";

// Encode ingredient entry data into a Meal structure
function encodeIngredientEntry(entry: IngredientEntryData): Meal {
  return {
    name: JSON.stringify({
      closingBalance: entry.closingBalance,
      nextDayOrder: entry.nextDayOrder,
    }),
    ingredients: [
      {
        name: entry.name,
        category: entry.category,
      },
    ],
  };
}

// Decode a DailyRecord into our app format, attaching its position index
function decodeDailyRecord(
  record: DailyRecord,
  index: number,
): SavedDailyRecord {
  const entries: IngredientEntryData[] = record.meals.map((meal) => {
    const data = JSON.parse(meal.name);
    return {
      name: meal.ingredients[0].name,
      category: meal.ingredients[0].category,
      closingBalance: data.closingBalance || 0,
      nextDayOrder: data.nextDayOrder || 0,
    };
  });

  return {
    entries,
    timestamp: record.timestamp,
    restaurantName: record.restaurantName || "",
    recordIndex: index,
    orderNo: index + 1,
  };
}

/** Map frontend ConcernStatus to backend ConcernStatus enum variant */
function toBackendStatus(status: ConcernStatus): BackendConcernStatusEnum {
  switch (status) {
    case "received":
    case "accepted": // legacy localStorage compat
      return BackendConcernStatusEnum.received;
    case "notReceived":
    case "rejected": // legacy localStorage compat
      return BackendConcernStatusEnum.notReceived;
    case "short":
      return BackendConcernStatusEnum.short_;
    case "spoiled":
      return BackendConcernStatusEnum.spoiled;
    case "expired":
      return BackendConcernStatusEnum.expired;
    case "damage":
      return BackendConcernStatusEnum.damage;
    default:
      return BackendConcernStatusEnum.received;
  }
}

/** Map backend ConcernStatus enum variant to frontend ConcernStatus */
function fromBackendStatus(status: BackendConcernStatusEnum): ConcernStatus {
  switch (status) {
    case BackendConcernStatusEnum.received:
      return "received";
    case BackendConcernStatusEnum.notReceived:
      return "notReceived";
    case BackendConcernStatusEnum.short_:
      return "short";
    case BackendConcernStatusEnum.spoiled:
      return "spoiled";
    case BackendConcernStatusEnum.expired:
      return "expired";
    case BackendConcernStatusEnum.damage:
      return "damage";
    default:
      return "received";
  }
}

/** Decode backend ConcernRecord to frontend ConcernRecord */
function decodeConcernRecord(record: BackendConcernRecord): ConcernRecord {
  return {
    recordIndex: Number(record.orderId),
    restaurantName: record.restaurantName,
    timestamp: 0,
    itemStatuses: record.itemStatuses.map((s) => ({
      itemName: s.itemName,
      category: "",
      orderQty: s.orderQty,
      status: fromBackendStatus(s.status),
      receivedQty: s.receivedQty ?? undefined,
    })),
    confirmedAt: Number(record.confirmedAt),
    confirmedBy: record.confirmedBy,
  };
}

export function useGetAllDailyRecords() {
  return useQuery<SavedDailyRecord[]>({
    queryKey: ["dailyRecords"],
    queryFn: async () => {
      const actor = await getAnonActor();
      const records = await actor.getAllDailyRecords();
      return records.map((record, index) => decodeDailyRecord(record, index));
    },
    retry: 2,
    retryDelay: 1000,
    staleTime: 30000,
    refetchOnWindowFocus: false,
    refetchInterval: 30000,
  });
}

export function useAddDailyRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      entries: IngredientEntryData[];
      timestamp: bigint;
      restaurantName: string;
    }) => {
      const meals = payload.entries.map(encodeIngredientEntry);
      try {
        const actor = await getFreshActor();
        const recordId = await actor.addDailyRecord(
          meals,
          payload.timestamp,
          payload.restaurantName,
        );
        return recordId;
      } catch (error) {
        const { userMessage, originalError } = extractActorError(error);
        const enhancedError = new Error(userMessage);
        (enhancedError as Error & { originalError: unknown }).originalError =
          originalError;
        throw enhancedError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dailyRecords"] });
    },
  });
}

/**
 * Fetch the confirmed concern record for a specific order from the backend.
 * Returns null if no concern has been confirmed yet.
 */
export function useGetConcernRecord(orderId: number, restaurantName: string) {
  return useQuery<ConcernRecord | null>({
    queryKey: ["concernRecord", orderId, restaurantName],
    queryFn: async () => {
      const actor = await getAnonActor();
      const result = await actor.getConcernRecord(
        BigInt(orderId),
        restaurantName,
      );
      if (!result) return null;
      return decodeConcernRecord(result);
    },
    enabled: orderId >= 0 && restaurantName !== "",
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });
}

/**
 * Save a confirmed concern record to the backend.
 * Once saved, the backend enforces immutability — subsequent saves for the same
 * (orderId, restaurantName) are silently ignored.
 */
export function useSaveConcernRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      orderId: number;
      restaurantName: string;
      itemStatuses: ConcernItemStatus[];
      confirmedBy: string;
    }) => {
      const backendStatuses: BackendConcernItemStatus[] =
        payload.itemStatuses.map((s) => {
          const base: BackendConcernItemStatus = {
            itemName: s.itemName,
            orderQty: s.orderQty,
            status: toBackendStatus(s.status),
          };
          if (s.status === "short" && s.receivedQty !== undefined) {
            return { ...base, receivedQty: s.receivedQty };
          }
          return base;
        });

      try {
        const actor = await getFreshActor();
        await actor.saveConcernRecord(
          BigInt(payload.orderId),
          payload.restaurantName,
          backendStatuses,
          payload.confirmedBy,
        );
      } catch (error) {
        const { userMessage, originalError } = extractActorError(error);
        const enhancedError = new Error(userMessage);
        (enhancedError as Error & { originalError: unknown }).originalError =
          originalError;
        throw enhancedError;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          "concernRecord",
          variables.orderId,
          variables.restaurantName,
        ],
      });
      queryClient.invalidateQueries({ queryKey: ["allConcernRecords"] });
    },
  });
}

/**
 * Fetch all confirmed concern records (for admin reporting).
 */
export function useGetAllConcernRecords() {
  return useQuery<ConcernRecord[]>({
    queryKey: ["allConcernRecords"],
    queryFn: async () => {
      const actor = await getAnonActor();
      const results = await actor.getAllConcernRecords();
      return results.map(decodeConcernRecord);
    },
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });
}
