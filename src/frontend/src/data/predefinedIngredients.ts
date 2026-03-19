export interface PredefinedIngredient {
  name: string;
  category: "Vegetables" | "Dairy" | "Non-Veg" | "Disposable" | "Beverages";
}

export const CATEGORIES = [
  "Vegetables",
  "Dairy",
  "Non-Veg",
  "Disposable",
  "Beverages",
] as const;

export const PREDEFINED_INGREDIENTS: PredefinedIngredient[] = [
  // Vegetables
  { name: "TOMATO/kg", category: "Vegetables" },
  { name: "POTATO / kg", category: "Vegetables" },
  { name: "CAPSICUM /kg", category: "Vegetables" },
  { name: "CARROT/ kg", category: "Vegetables" },
  { name: "CABBAGE /kg", category: "Vegetables" },
  { name: "CAULIFLOWER /kg", category: "Vegetables" },
  { name: "SPRING ONION/ kg", category: "Vegetables" },
  { name: "RED CAPSICUM kg/gm", category: "Vegetables" },
  { name: "YELLOW CAPSICUM kg/gm", category: "Vegetables" },
  { name: "GREEN ZUCCINI kg/gm", category: "Vegetables" },
  { name: "YELLOW ZUCCINI kg/gm", category: "Vegetables" },
  { name: "RAW PAPAYA/ pcs", category: "Vegetables" },
  { name: "STAFF VEG /kg", category: "Vegetables" },
  { name: "LEMON /kg", category: "Vegetables" },
  { name: "MINT /kg", category: "Vegetables" },
  { name: "GINGER /kg", category: "Vegetables" },
  { name: "GARLIC /kg", category: "Vegetables" },
  { name: "BEANS/kg", category: "Vegetables" },
  { name: "GREEN CHILLI /kg", category: "Vegetables" },
  { name: "CORIANDER /kg", category: "Vegetables" },
  { name: "ONION /kg", category: "Vegetables" },
  { name: "BROKELY /kg", category: "Vegetables" },
  { name: "BABYCORN/ pkt", category: "Vegetables" },
  { name: "PALAK/ kg", category: "Vegetables" },
  // Dairy
  { name: "MILK /ltr", category: "Dairy" },
  { name: "CREAM / ltr", category: "Dairy" },
  { name: "BUTTER / kg,gm", category: "Dairy" },
  { name: "SOYA CHAAP / kg", category: "Dairy" },
  { name: "SAFAL MATAR / kg", category: "Dairy" },
  { name: "EGG /tray", category: "Dairy" },
  { name: "DAHI /kg", category: "Dairy" },
  { name: "PANEER/kg", category: "Dairy" },
  { name: "NOODLE /pkt", category: "Dairy" },
  // Non-Veg
  { name: "CHIC BREAST /kg", category: "Non-Veg" },
  { name: "TANDOORI CHIC / pcs", category: "Non-Veg" },
  { name: "CHIC THAI / kg", category: "Non-Veg" },
  { name: "MUTTON BONLESS /kg", category: "Non-Veg" },
  { name: "MUTTON CUT / kg", category: "Non-Veg" },
  { name: "CHIC WING /kg", category: "Non-Veg" },
  // Disposable
  { name: "40ML CHUTNI CUP /pkt", category: "Disposable" },
  { name: "PRINTER ROLL /no.", category: "Disposable" },
  { name: "BUTTER PAPER /gm,kg", category: "Disposable" },
  { name: "100ML RAITA CUP /pkt", category: "Disposable" },
  { name: "PACKING TAPE /no.", category: "Disposable" },
  { name: "DINNER PLATE /pkt", category: "Disposable" },
  { name: "CARRY BAG /kg", category: "Disposable" },
  { name: "PAPER NAPKIN /pkt", category: "Disposable" },
  { name: "GLASS CUP /pkt", category: "Disposable" },
  { name: "LID B. RECTANGEL /pkt", category: "Disposable" },
  { name: "BLACK RECTANGEL /pkt", category: "Disposable" },
  { name: "CLING FILM /roll", category: "Disposable" },
  { name: "CHEF CAP /pkt", category: "Disposable" },
  { name: "SILVER FOIL /roll", category: "Disposable" },
  { name: "SILVER CONTAINER /pkt", category: "Disposable" },
  { name: "SPOON /pkt", category: "Disposable" },
  { name: "FORK /pkt", category: "Disposable" },
  { name: "40ML PACKING CUP /pkt", category: "Disposable" },
  { name: "ADD ON BOWL /pkt", category: "Disposable" },
  { name: "SOUP SPOON /pkt", category: "Disposable" },
  { name: "SOUP BOWL /pkt", category: "Disposable" },
  { name: "MENU CARD /no.", category: "Disposable" },
  // Beverages
  { name: "COKE 330ML /case", category: "Beverages" },
  { name: "THUMPS 330ML /case", category: "Beverages" },
  { name: "SPRITE CAN /case", category: "Beverages" },
  { name: "DIET COKE /case", category: "Beverages" },
  { name: "FANTA CAN /case", category: "Beverages" },
  { name: "PEPSI 475 /case", category: "Beverages" },
  { name: "PEPSI 400 /case", category: "Beverages" },
  { name: "7UP 475 /case", category: "Beverages" },
  { name: "MIRINDA 475 /case", category: "Beverages" },
  { name: "WATER BTL /case", category: "Beverages" },
];

export function getIngredientsByCategory(
  category: string,
): PredefinedIngredient[] {
  return PREDEFINED_INGREDIENTS.filter((ing) => ing.category === category);
}
