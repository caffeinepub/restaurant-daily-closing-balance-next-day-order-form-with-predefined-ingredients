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
    restaurantName: string;
    timestamp: Timestamp;
}
export interface UserProfile {
    name: string;
    restaurantName: string;
}
export interface Category {
    name: CategoryName;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addDailyRecord(meals: Array<Meal>, timestamp: Timestamp, restaurantName: string): Promise<DailyRecordId>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getAllCategories(): Promise<Array<Category>>;
    getAllDailyRecords(): Promise<Array<DailyRecord>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCategoriesByType(categoryType: string): Promise<Array<Category>>;
    getIngredientsByCategory(category: CategoryName): Promise<Array<Ingredient>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
}
