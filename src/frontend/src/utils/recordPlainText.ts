import { CATEGORIES } from "../data/predefinedIngredients";
import type { SavedDailyRecord } from "../types/dailyForm";

/**
 * Converts a SavedDailyRecord into a vendor-friendly plain-text format
 * that can be copied and sent via message.
 * Only includes ingredients with non-zero order values.
 * Does not include balance values.
 * Order Date = Balance Date + 1 day.
 */
export function formatRecordAsPlainText(record: SavedDailyRecord): string {
  // Compute Order Date = Balance Date + 1
  const balanceMs = Number(record.timestamp);
  const orderDateMs = balanceMs + 24 * 60 * 60 * 1000;
  const orderDate = new Date(orderDateMs);
  const day = orderDate.getDate().toString().padStart(2, "0");
  const month = (orderDate.getMonth() + 1).toString().padStart(2, "0");
  const year = orderDate.getFullYear();
  const formattedOrderDate = `${day}/${month}/${year}`;

  let text = `${record.restaurantName}\n`;
  text += `Order Date: ${formattedOrderDate}\n`;
  text += `${"=".repeat(30)}\n\n`;

  for (const category of CATEGORIES) {
    const categoryEntries = record.entries.filter(
      (entry) => entry.category === category && entry.nextDayOrder > 0,
    );

    if (categoryEntries.length > 0) {
      text += `${category.toUpperCase()}\n`;
      text += `${"-".repeat(20)}\n`;

      for (const entry of categoryEntries) {
        text += `${entry.name}: ${entry.nextDayOrder}\n`;
      }

      text += "\n";
    }
  }

  return text;
}
