export interface PredefinedIngredient {
  name: string;
  category: 'Vegetables' | 'Dairy' | 'Non-Veg';
}

export const CATEGORIES = ['Vegetables', 'Dairy', 'Non-Veg'] as const;

export const PREDEFINED_INGREDIENTS: PredefinedIngredient[] = [
  // Vegetables
  { name: 'TOMATO/kg', category: 'Vegetables' },
  { name: 'POTATO / kg', category: 'Vegetables' },
  { name: 'CAPSICUM /kg', category: 'Vegetables' },
  { name: 'CARROT/ kg', category: 'Vegetables' },
  { name: 'CABBAGE /kg', category: 'Vegetables' },
  { name: 'CAULIFLOWER /kg', category: 'Vegetables' },
  { name: 'SPRING ONION/ kg', category: 'Vegetables' },
  { name: 'RED CAPSICUM kg/gm', category: 'Vegetables' },
  { name: 'YELLOW CAPSICUM kg/gm', category: 'Vegetables' },
  { name: 'GREEN ZUCCINI kg/gm', category: 'Vegetables' },
  { name: 'YELLOW ZUCCINI kg/gm', category: 'Vegetables' },
  { name: 'RAW PAPAYA/ pcs', category: 'Vegetables' },
  { name: 'STAFF VEG /kg', category: 'Vegetables' },
  { name: 'LEMON /kg', category: 'Vegetables' },
  { name: 'MINT /kg', category: 'Vegetables' },
  { name: 'GINGER /kg', category: 'Vegetables' },
  { name: 'GARLIC /kg', category: 'Vegetables' },
  { name: 'BEANS/kg', category: 'Vegetables' },
  { name: 'GREEN CHILLI /kg', category: 'Vegetables' },
  { name: 'CORIANDER /kg', category: 'Vegetables' },
  { name: 'ONION /kg', category: 'Vegetables' },
  // Dairy
  { name: 'MILK /ltr', category: 'Dairy' },
  { name: 'CREAM / ltr', category: 'Dairy' },
  { name: 'BUTTER / kg,gm', category: 'Dairy' },
  { name: 'SOYA CHAAP / kg', category: 'Dairy' },
  { name: 'SAFAL MATAR / kg', category: 'Dairy' },
  { name: 'EGG /tray', category: 'Dairy' },
  { name: 'PANEER/kg', category: 'Dairy' },
  // Non-Veg
  { name: 'CHIC BREAST /kg', category: 'Non-Veg' },
  { name: 'TANDOORI CHIC / pcs', category: 'Non-Veg' },
  { name: 'CHIC THAI / kg', category: 'Non-Veg' },
  { name: 'MUTTON BONLESS /kg', category: 'Non-Veg' },
  { name: 'MUTTON CUT / kg', category: 'Non-Veg' },
  { name: 'CHIC WING /kg', category: 'Non-Veg' },
];

export function getIngredientsByCategory(category: string): PredefinedIngredient[] {
  return PREDEFINED_INGREDIENTS.filter((ing) => ing.category === category);
}
