export interface PredefinedIngredient {
  name: string;
  category: 'Vegetables' | 'Dairy' | 'Non-Veg';
}

export const CATEGORIES = ['Vegetables', 'Dairy', 'Non-Veg'] as const;

export const PREDEFINED_INGREDIENTS: PredefinedIngredient[] = [
  // Vegetables
  { name: 'Tomat', category: 'Vegetables' },
  { name: 'Poatao', category: 'Vegetables' },
  { name: 'Capsicum', category: 'Vegetables' },
  { name: 'Carrot', category: 'Vegetables' },
  { name: 'cabbage', category: 'Vegetables' },
  { name: 'cauliflower', category: 'Vegetables' },
  { name: 'spring onion', category: 'Vegetables' },
  { name: 'red capsicum', category: 'Vegetables' },
  { name: 'yellow capsicum', category: 'Vegetables' },
  { name: 'green zuccini', category: 'Vegetables' },
  { name: 'yellow zuccini', category: 'Vegetables' },
  { name: 'raw papya', category: 'Vegetables' },
  { name: 'staff vegetable', category: 'Vegetables' },
  { name: 'lemon', category: 'Vegetables' },
  { name: 'mint', category: 'Vegetables' },
  { name: 'ginger', category: 'Vegetables' },
  { name: 'garlic', category: 'Vegetables' },
  // Dairy
  { name: 'milk', category: 'Dairy' },
  { name: 'cream', category: 'Dairy' },
  { name: 'butter', category: 'Dairy' },
  { name: 'chaap', category: 'Dairy' },
  { name: 'matar', category: 'Dairy' },
  { name: 'egg', category: 'Dairy' },
  { name: 'Dahi', category: 'Dairy' },
  // Non-Veg
  { name: 'chicken bonless', category: 'Non-Veg' },
  { name: 'tandoori chicken', category: 'Non-Veg' },
  { name: 'chicken thai', category: 'Non-Veg' },
  { name: 'mutton boneless', category: 'Non-Veg' },
  { name: 'mutton cut', category: 'Non-Veg' },
  { name: 'wings', category: 'Non-Veg' },
];

export function getIngredientsByCategory(category: string): PredefinedIngredient[] {
  return PREDEFINED_INGREDIENTS.filter((ing) => ing.category === category);
}
