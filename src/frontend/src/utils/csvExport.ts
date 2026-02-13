import type { SavedDailyRecord } from '../types/dailyForm';

export function exportRecordToCSV(record: SavedDailyRecord): void {
  const headers = ['Category', 'Ingredient', 'Balance', 'Order'];
  
  const rows = record.entries.map((entry) => [
    entry.category,
    entry.name,
    entry.closingBalance.toString(),
    entry.nextDayOrder.toString(),
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  const date = new Date(Number(record.timestamp));
  const filename = `inventory_${date.toISOString().split('T')[0]}.csv`;
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
