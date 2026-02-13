import { SavedDailyRecord } from '../types/dailyForm';
import { CATEGORIES } from '../data/predefinedIngredients';
import { formatDateDDMMYYYY } from './dateFormat';

/**
 * Converts a SavedDailyRecord into a vendor-friendly plain-text format
 * that can be copied and sent via message.
 * Only includes ingredients with non-zero order values.
 * Does not include balance values.
 */
export function formatRecordAsPlainText(record: SavedDailyRecord): string {
  const formattedDate = formatDateDDMMYYYY(record.timestamp);

  let text = `Daily Inventory Order\n`;
  text += `Restaurant: ${record.restaurantName}\n`;
  text += `Balance Date: ${formattedDate}\n`;
  text += `${'='.repeat(50)}\n\n`;

  CATEGORIES.forEach((category) => {
    const categoryEntries = record.entries.filter(
      (entry) => entry.category === category && entry.nextDayOrder > 0
    );

    if (categoryEntries.length > 0) {
      text += `${category.toUpperCase()}\n`;
      text += `${'-'.repeat(50)}\n`;

      categoryEntries.forEach((entry) => {
        text += `${entry.name}: ${entry.nextDayOrder}\n`;
      });

      text += `\n`;
    }
  });

  return text;
}
