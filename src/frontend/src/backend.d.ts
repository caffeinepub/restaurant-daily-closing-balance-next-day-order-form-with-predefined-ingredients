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
export interface MasterCategory {
    id: string;
    name: string;
}
export type Timestamp = bigint;
export interface RestaurantUser {
    username: string;
    password: string;
    restaurantName: string;
}
export interface RawMaterial {
    id: string;
    name: string;
    category: string;
}
export interface Ingredient {
    name: string;
    category: CategoryName;
}
export interface ConcernRecord {
    confirmedAt: bigint;
    confirmedBy: string;
    itemStatuses: Array<ConcernItemStatus>;
    orderId: bigint;
    restaurantName: string;
}
export interface ConcernItemStatus {
    status: ConcernStatus;
    receivedQty?: number;
    itemName: string;
    orderQty: number;
}
export type CategoryName = string;
export interface RestaurantAssignment {
    allowedItems: Array<string>;
    allowedCategories: Array<string>;
    restaurantName: string;
}
export interface DailyRecord {
    meals: Array<Meal>;
    restaurantName: string;
    timestamp: Timestamp;
}
export interface Restaurant {
    id: string;
    name: string;
}
export enum ConcernStatus {
    notReceived = "notReceived",
    damage = "damage",
    expired = "expired",
    short_ = "short",
    spoiled = "spoiled",
    received = "received"
}
export interface backendInterface {
    addCategory(name: string): Promise<void>;
    addDailyRecord(meals: Array<Meal>, timestamp: Timestamp, restaurantName: string): Promise<bigint>;
    addRawMaterial(name: string, category: string): Promise<void>;
    addRestaurant(name: string): Promise<void>;
    addUser(username: string, password: string, restaurantName: string): Promise<void>;
    deleteCategory(id: string): Promise<void>;
    deleteRawMaterial(id: string): Promise<void>;
    deleteRestaurant(id: string): Promise<void>;
    deleteUser(username: string): Promise<void>;
    getAllCategories(): Promise<Array<{
        name: string;
    }>>;
    /**
     * / Retrieve all stored concern records (for admin / reporting).
     */
    getAllConcernRecords(): Promise<Array<ConcernRecord>>;
    getAllDailyRecords(): Promise<Array<DailyRecord>>;
    getCategories(): Promise<Array<MasterCategory>>;
    /**
     * / Retrieve the confirmed concern record for a specific order, if any.
     */
    getConcernRecord(orderId: bigint, restaurantName: string): Promise<ConcernRecord | null>;
    getIngredientsByCategory(cat: string): Promise<Array<{
        name: string;
        category: string;
    }>>;
    getRawMaterials(): Promise<Array<RawMaterial>>;
    getRawMaterialsByCategory(cat: string): Promise<Array<RawMaterial>>;
    getRestaurantAssignment(restaurantName: string): Promise<RestaurantAssignment | null>;
    getRestaurants(): Promise<Array<Restaurant>>;
    getUsers(): Promise<Array<RestaurantUser>>;
    resetToDefaultCredentials(): Promise<void>;
    /**
     * / Save concern statuses for an order. Once saved, the record is permanently
     * / stored on-chain and visible to all users. Subsequent calls for the same
     * / (orderId, restaurantName) are silently ignored to enforce immutability.
     */
    saveConcernRecord(orderId: bigint, restaurantName: string, itemStatuses: Array<ConcernItemStatus>, confirmedBy: string): Promise<void>;
    seedDefaultData(): Promise<void>;
    setAdminPassword(newPwd: string): Promise<void>;
    setRestaurantAssignment(restaurantName: string, allowedCategories: Array<string>, allowedItems: Array<string>): Promise<void>;
    updateCategory(id: string, name: string): Promise<void>;
    updateRawMaterial(id: string, name: string, category: string): Promise<void>;
    updateRestaurant(id: string, name: string): Promise<void>;
    updateUser(username: string, password: string, restaurantName: string): Promise<void>;
    verifyAdminPassword(pwd: string): Promise<boolean>;
    verifyUserLogin(username: string, password: string): Promise<string | null>;
}
