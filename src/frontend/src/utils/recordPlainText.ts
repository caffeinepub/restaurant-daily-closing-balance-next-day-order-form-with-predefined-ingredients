import { SavedDailyRecord } from '../types/dailyForm';
import { CATEGORIES } from '../data/predefinedIngredients';

/**
 * Converts a SavedDailyRecord into a vendor-friendly plain-text format
 * that can be copied and sent via message.
 */
export function formatRecordAsPlainText(record: SavedDailyRecord): string {
  const date = new Date(Number(record.timestamp));
  const formattedDate = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  let text = `Daily Inventory Record\n`;
  text += `Balance Date: ${formattedDate}\n`;
  text += `${'='.repeat(50)}\n\n`;

  CATEGORIES.forEach((category) => {
    const categoryEntries = record.entries.filter((entry) => entry.category === category);

    if (categoryEntries.length > 0) {
      text += `${category.toUpperCase()}\n`;
      text += `${'-'.repeat(50)}\n`;

      categoryEntries.forEach((entry) => {
        text += `${entry.name} | Unit: ${entry.unit} | Closing: ${entry.closingBalance} | Next Day Order: ${entry.nextDayOrder}\n`;
      });

      text += `\n`;
    }
  });

  return text;
}
