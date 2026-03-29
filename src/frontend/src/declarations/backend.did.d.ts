/* eslint-disable */

// @ts-nocheck

import type { ActorMethod } from '@icp-sdk/core/agent';
import type { IDL } from '@icp-sdk/core/candid';
import type { Principal } from '@icp-sdk/core/principal';

export type CategoryName = string;
export interface Ingredient { 'name' : string, 'category' : CategoryName }
export interface Meal { 'name' : string, 'ingredients' : Array<Ingredient> }
export type Timestamp = bigint;
export interface DailyRecord {
  'meals' : Array<Meal>,
  'restaurantName' : string,
  'timestamp' : Timestamp,
}
export interface Restaurant { 'id' : string, 'name' : string }
export interface RestaurantUser { 'username' : string, 'password' : string, 'restaurantName' : string }
export interface MasterCategory { 'id' : string, 'name' : string }
export interface RawMaterial { 'id' : string, 'name' : string, 'category' : string }
export interface Category { 'name' : CategoryName }
export interface UserProfile { 'name' : string, 'restaurantName' : string }
export interface RestaurantAssignment { 'restaurantName' : string, 'allowedCategories' : Array<string>, 'allowedItems' : Array<string> }

export interface _SERVICE {
  'seedDefaultData' : ActorMethod<[], undefined>,
  'resetToDefaultCredentials' : ActorMethod<[], undefined>,
  'addDailyRecord' : ActorMethod<[Array<Meal>, Timestamp, string], bigint>,
  'getAllDailyRecords' : ActorMethod<[], Array<DailyRecord>>,
  'getRestaurants' : ActorMethod<[], Array<Restaurant>>,
  'addRestaurant' : ActorMethod<[string], undefined>,
  'updateRestaurant' : ActorMethod<[string, string], undefined>,
  'deleteRestaurant' : ActorMethod<[string], undefined>,
  'getUsers' : ActorMethod<[], Array<RestaurantUser>>,
  'addUser' : ActorMethod<[string, string, string], undefined>,
  'updateUser' : ActorMethod<[string, string, string], undefined>,
  'deleteUser' : ActorMethod<[string], undefined>,
  'verifyUserLogin' : ActorMethod<[string, string], [] | [string]>,
  'getCategories' : ActorMethod<[], Array<MasterCategory>>,
  'addCategory' : ActorMethod<[string], undefined>,
  'updateCategory' : ActorMethod<[string, string], undefined>,
  'deleteCategory' : ActorMethod<[string], undefined>,
  'getRawMaterials' : ActorMethod<[], Array<RawMaterial>>,
  'getRawMaterialsByCategory' : ActorMethod<[string], Array<RawMaterial>>,
  'addRawMaterial' : ActorMethod<[string, string], undefined>,
  'updateRawMaterial' : ActorMethod<[string, string, string], undefined>,
  'deleteRawMaterial' : ActorMethod<[string], undefined>,
  'verifyAdminPassword' : ActorMethod<[string], boolean>,
  'setAdminPassword' : ActorMethod<[string], undefined>,
  'getAllCategories' : ActorMethod<[], Array<Category>>,
  'getIngredientsByCategory' : ActorMethod<[CategoryName], Array<Ingredient>>,
  'getRestaurantAssignment' : ActorMethod<[string], [] | [RestaurantAssignment]>,
  'setRestaurantAssignment' : ActorMethod<[string, Array<string>, Array<string>], undefined>,
}
export declare const idlService: IDL.ServiceClass;
export declare const idlInitArgs: IDL.Type[];
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
