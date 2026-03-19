import {
  CATEGORIES,
  PREDEFINED_INGREDIENTS,
} from "../data/predefinedIngredients";

const RESTAURANTS_KEY = "hoshnagi_restaurants";
const USERS_KEY = "hoshnagi_users";
const CATEGORIES_KEY = "hoshnagi_categories";
const RAW_MATERIALS_KEY = "hoshnagi_raw_materials";

export interface Restaurant {
  id: string;
  name: string;
}

export interface RestaurantUser {
  username: string;
  password: string;
  restaurantName: string;
}

export interface MasterCategory {
  id: string;
  name: string;
}

export interface RawMaterial {
  id: string;
  name: string;
  category: string;
}

export function initMasterData() {
  if (!localStorage.getItem(RESTAURANTS_KEY)) {
    const defaultRestaurants: Restaurant[] = [
      { id: "1", name: "Andaaz" },
      { id: "2", name: "Kai wok Express" },
    ];
    localStorage.setItem(RESTAURANTS_KEY, JSON.stringify(defaultRestaurants));
  }

  if (!localStorage.getItem(USERS_KEY)) {
    const defaultUsers: RestaurantUser[] = [
      { username: "andaaz", password: "andaaz123", restaurantName: "Andaaz" },
      {
        username: "kaiwok",
        password: "kaiwok123",
        restaurantName: "Kai wok Express",
      },
    ];
    localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
  }

  if (!localStorage.getItem(CATEGORIES_KEY)) {
    const cats: MasterCategory[] = CATEGORIES.map((name, i) => ({
      id: String(i + 1),
      name,
    }));
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(cats));
  }

  if (!localStorage.getItem(RAW_MATERIALS_KEY)) {
    const mats: RawMaterial[] = PREDEFINED_INGREDIENTS.map((ing, i) => ({
      id: String(i + 1),
      name: ing.name,
      category: ing.category,
    }));
    localStorage.setItem(RAW_MATERIALS_KEY, JSON.stringify(mats));
  }
}

// --- Restaurants ---
export function getRestaurants(): Restaurant[] {
  try {
    return JSON.parse(localStorage.getItem(RESTAURANTS_KEY) || "[]");
  } catch {
    return [];
  }
}

export function addRestaurant(name: string): void {
  const list = getRestaurants();
  const id = String(Date.now());
  list.push({ id, name });
  localStorage.setItem(RESTAURANTS_KEY, JSON.stringify(list));
}

export function updateRestaurant(id: string, name: string): void {
  const list = getRestaurants().map((r) => (r.id === id ? { ...r, name } : r));
  localStorage.setItem(RESTAURANTS_KEY, JSON.stringify(list));
}

export function deleteRestaurant(id: string): void {
  const list = getRestaurants().filter((r) => r.id !== id);
  localStorage.setItem(RESTAURANTS_KEY, JSON.stringify(list));
}

// --- Users ---
export function getUsers(): RestaurantUser[] {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
  } catch {
    return [];
  }
}

export function addUser(
  username: string,
  password: string,
  restaurantName: string,
): void {
  const list = getUsers();
  list.push({ username, password, restaurantName });
  localStorage.setItem(USERS_KEY, JSON.stringify(list));
}

export function updateUser(
  username: string,
  newPassword: string,
  restaurantName: string,
): void {
  const list = getUsers().map((u) =>
    u.username === username
      ? { ...u, password: newPassword, restaurantName }
      : u,
  );
  localStorage.setItem(USERS_KEY, JSON.stringify(list));
}

export function deleteUser(username: string): void {
  const list = getUsers().filter((u) => u.username !== username);
  localStorage.setItem(USERS_KEY, JSON.stringify(list));
}

export function loginUser(
  username: string,
  password: string,
): RestaurantUser | null {
  const list = getUsers();
  return (
    list.find((u) => u.username === username && u.password === password) ?? null
  );
}

// --- Categories ---
export function getMasterCategories(): MasterCategory[] {
  try {
    return JSON.parse(localStorage.getItem(CATEGORIES_KEY) || "[]");
  } catch {
    return [];
  }
}

export function addCategory(name: string): void {
  const list = getMasterCategories();
  const id = String(Date.now());
  list.push({ id, name });
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(list));
}

export function updateCategory(id: string, name: string): void {
  const list = getMasterCategories().map((c) =>
    c.id === id ? { ...c, name } : c,
  );
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(list));
}

export function deleteCategory(id: string): void {
  const list = getMasterCategories().filter((c) => c.id !== id);
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(list));
}

// --- Raw Materials ---
export function getRawMaterials(): RawMaterial[] {
  try {
    return JSON.parse(localStorage.getItem(RAW_MATERIALS_KEY) || "[]");
  } catch {
    return [];
  }
}

export function getRawMaterialsByCategory(category: string): RawMaterial[] {
  return getRawMaterials().filter((m) => m.category === category);
}

export function addRawMaterial(name: string, category: string): void {
  const list = getRawMaterials();
  const id = String(Date.now());
  list.push({ id, name, category });
  localStorage.setItem(RAW_MATERIALS_KEY, JSON.stringify(list));
}

export function updateRawMaterial(
  id: string,
  name: string,
  category: string,
): void {
  const list = getRawMaterials().map((m) =>
    m.id === id ? { ...m, name, category } : m,
  );
  localStorage.setItem(RAW_MATERIALS_KEY, JSON.stringify(list));
}

export function deleteRawMaterial(id: string): void {
  const list = getRawMaterials().filter((m) => m.id !== id);
  localStorage.setItem(RAW_MATERIALS_KEY, JSON.stringify(list));
}
