import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { DailyRecord, Meal } from "../backend";
import type { IngredientEntryData, SavedDailyRecord } from "../types/dailyForm";
import { extractActorError } from "../utils/actorError";
import { useActor } from "./useActor";

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

export function useGetAllDailyRecords() {
  const { actor, isFetching } = useActor();

  return useQuery<SavedDailyRecord[]>({
    queryKey: ["dailyRecords"],
    queryFn: async () => {
      if (!actor) {
        throw new Error("Backend connection not available");
      }
      const records = await actor.getAllDailyRecords();
      return records.map((record, index) => decodeDailyRecord(record, index));
    },
    enabled: !!actor && !isFetching,
    retry: 2,
    retryDelay: 1000,
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchInterval: 30000,
  });
}

export function useAddDailyRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      entries: IngredientEntryData[];
      timestamp: bigint;
      restaurantName: string;
    }) => {
      if (!actor) {
        throw new Error(
          "Backend connection not available. Please check your connection and try again.",
        );
      }

      const meals = payload.entries.map(encodeIngredientEntry);

      try {
        // Call backend with correct parameter order: meals, timestamp, restaurantName
        const recordId = await actor.addDailyRecord(
          meals,
          payload.timestamp,
          payload.restaurantName,
        );
        return recordId;
      } catch (error) {
        // Extract and re-throw with structured error
        const { userMessage, originalError } = extractActorError(error);
        const enhancedError = new Error(userMessage);
        (enhancedError as any).originalError = originalError;
        throw enhancedError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dailyRecords"] });
    },
  });
}
