import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { DailyRecord, Meal } from '../backend';
import type { IngredientEntryData, SavedDailyRecord } from '../types/dailyForm';

// Encode ingredient entry data into a Meal structure
function encodeIngredientEntry(entry: IngredientEntryData): Meal {
  return {
    name: JSON.stringify({
      unit: entry.unit,
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

// Decode a DailyRecord into our app format
function decodeDailyRecord(record: DailyRecord): SavedDailyRecord {
  const entries: IngredientEntryData[] = record.meals.map((meal) => {
    const data = JSON.parse(meal.name);
    return {
      name: meal.ingredients[0].name,
      category: meal.ingredients[0].category,
      unit: data.unit || '',
      closingBalance: data.closingBalance || 0,
      nextDayOrder: data.nextDayOrder || 0,
    };
  });

  return {
    entries,
    timestamp: record.timestamp,
  };
}

export function useGetAllDailyRecords() {
  const { actor, isFetching } = useActor();

  return useQuery<SavedDailyRecord[]>({
    queryKey: ['dailyRecords'],
    queryFn: async () => {
      if (!actor) {
        throw new Error('Backend connection not available');
      }
      const records = await actor.getAllDailyRecords();
      return records.map(decodeDailyRecord);
    },
    enabled: !!actor && !isFetching,
    retry: 2,
    retryDelay: 1000,
  });
}

export function useAddDailyRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { entries: IngredientEntryData[]; timestamp: bigint }) => {
      if (!actor) throw new Error('Backend connection not available. Please check your connection and try again.');

      const meals = payload.entries.map(encodeIngredientEntry);

      return await actor.addDailyRecord(meals, payload.timestamp);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dailyRecords'] });
    },
  });
}
