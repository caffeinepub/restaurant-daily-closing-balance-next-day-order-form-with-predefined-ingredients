/**
 * Utility to map ingredient category names to Tailwind background color classes.
 * Used for tinting section containers and input fields based on category.
 */

export function getCategoryBgColor(category: string): string {
  switch (category) {
    case "Vegetables":
      return "bg-green-50 dark:bg-green-950/20";
    case "Dairy":
      return "bg-sky-50 dark:bg-sky-950/20";
    case "Non-Veg":
      return "bg-orange-50 dark:bg-orange-950/20";
    default:
      return "bg-background";
  }
}

export function getCategoryInputBgColor(category: string): string {
  switch (category) {
    case "Vegetables":
      return "bg-green-100 dark:bg-green-900/30";
    case "Dairy":
      return "bg-blue-100 dark:bg-blue-900/30";
    case "Non-Veg":
      return "bg-red-100 dark:bg-red-900/30";
    default:
      return "bg-white dark:bg-gray-800";
  }
}
