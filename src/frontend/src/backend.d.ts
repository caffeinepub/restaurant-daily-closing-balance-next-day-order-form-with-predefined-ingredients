import type { ActorSubclass } from "@dfinity/agent";

export interface Ingredient { name: string; category: string; }
export interface Meal { name: string; ingredients: Ingredient[]; }
export interface DailyRecord { meals: Meal[]; timestamp: bigint; restaurantName: string; }
export interface Restaurant { id: string; name: string; }
export interface RestaurantUser { username: string; password: string; restaurantName: string; }
export interface Category { id: string; name: string; }
export interface RawMaterial { id: string; name: string; category: string; }
export interface RestaurantAssignment { restaurantName: string; allowedCategories: string[]; allowedItems: string[]; }

export interface BackendActor {
  // Seed
  seedDefaultData: () => Promise<void>;
  resetToDefaultCredentials: () => Promise<void>;
  // Daily records
  addDailyRecord: (meals: Meal[], timestamp: bigint, restaurantName: string) => Promise<bigint>;
  getAllDailyRecords: () => Promise<DailyRecord[]>;
  // Restaurants
  getRestaurants: () => Promise<Restaurant[]>;
  addRestaurant: (name: string) => Promise<void>;
  updateRestaurant: (id: string, name: string) => Promise<void>;
  deleteRestaurant: (id: string) => Promise<void>;
  // Users
  getUsers: () => Promise<RestaurantUser[]>;
  addUser: (username: string, password: string, restaurantName: string) => Promise<void>;
  updateUser: (username: string, password: string, restaurantName: string) => Promise<void>;
  deleteUser: (username: string) => Promise<void>;
  verifyUserLogin: (username: string, password: string) => Promise<[string] | []>;
  // Categories
  getCategories: () => Promise<Category[]>;
  addCategory: (name: string) => Promise<void>;
  updateCategory: (id: string, name: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  // Raw Materials
  getRawMaterials: () => Promise<RawMaterial[]>;
  getRawMaterialsByCategory: (category: string) => Promise<RawMaterial[]>;
  addRawMaterial: (name: string, category: string) => Promise<void>;
  updateRawMaterial: (id: string, name: string, category: string) => Promise<void>;
  deleteRawMaterial: (id: string) => Promise<void>;
  // Restaurant Assignments
  getRestaurantAssignment: (restaurantName: string) => Promise<[RestaurantAssignment] | []>;
  setRestaurantAssignment: (restaurantName: string, allowedCategories: string[], allowedItems: string[]) => Promise<void>;
  // Admin password
  verifyAdminPassword: (password: string) => Promise<boolean>;
  setAdminPassword: (newPassword: string) => Promise<void>;
  // Legacy
  getAllCategories: () => Promise<{ name: string }[]>;
  getIngredientsByCategory: (category: string) => Promise<{ name: string; category: string }[]>;
}

declare const backend: ActorSubclass<BackendActor>;
export default backend;
