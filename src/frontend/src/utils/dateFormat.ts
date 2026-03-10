/**
 * Formats a bigint timestamp into dd/mm/yyyy format
 */
export function formatDateDDMMYYYY(timestamp: bigint): string {
  const date = new Date(Number(timestamp));
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Formats a date input value (YYYY-MM-DD string) into dd/mm/yyyy format
 */
export function formatInputDateDDMMYYYY(dateString: string): string {
  if (!dateString) return "";
  const date = new Date(`${dateString}T00:00:00`); // Add time to avoid timezone issues
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Given a YYYY-MM-DD balance date string, returns the Order Date (balance + 1 day)
 * formatted as dd/mm/yyyy
 */
export function getOrderDateFromBalanceDate(balanceDateString: string): string {
  if (!balanceDateString) return "";
  const date = new Date(`${balanceDateString}T00:00:00`);
  date.setDate(date.getDate() + 1);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}
