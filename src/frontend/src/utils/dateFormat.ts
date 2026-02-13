/**
 * Formats a bigint timestamp into dd/mm/yyyy format
 */
export function formatDateDDMMYYYY(timestamp: bigint): string {
  const date = new Date(Number(timestamp));
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}
