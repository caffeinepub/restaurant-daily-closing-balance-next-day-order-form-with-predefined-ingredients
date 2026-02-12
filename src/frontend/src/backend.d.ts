import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Meal {
    name: string;
    ingredients: Array<Ingredient>;
}
export type Timestamp = bigint;
export type DailyRecordId = bigint;
export interface Ingredient {
    name: string;
    category: CategoryName;
}
export type CategoryName = string;
export interface DailyRecord {
    meals: Array<Meal>;
    timestamp: Timestamp;
}
export interface Category {
    name: CategoryName;
}
export interface backendInterface {
    addDailyRecord(meals: Array<Meal>, timestamp: Timestamp): Promise<DailyRecordId>;
    getAllCategories(): Promise<Array<Category>>;
    getAllDailyRecords(): Promise<Array<DailyRecord>>;
    getCategoriesByType(categoryType: string): Promise<Array<Category>>;
    getIngredientsByCategory(category: CategoryName): Promise<Array<Ingredient>>;
}
