/* eslint-disable */

// @ts-nocheck

import { IDL } from '@icp-sdk/core/candid';

export const CategoryName = IDL.Text;
export const Ingredient = IDL.Record({
  'name' : IDL.Text,
  'category' : CategoryName,
});
export const Meal = IDL.Record({
  'name' : IDL.Text,
  'ingredients' : IDL.Vec(Ingredient),
});
export const Timestamp = IDL.Nat;
export const DailyRecord = IDL.Record({
  'meals' : IDL.Vec(Meal),
  'restaurantName' : IDL.Text,
  'timestamp' : Timestamp,
});
export const Restaurant = IDL.Record({ 'id' : IDL.Text, 'name' : IDL.Text });
export const RestaurantUser = IDL.Record({
  'username' : IDL.Text,
  'password' : IDL.Text,
  'restaurantName' : IDL.Text,
});
export const MasterCategory = IDL.Record({ 'id' : IDL.Text, 'name' : IDL.Text });
export const RawMaterial = IDL.Record({ 'id' : IDL.Text, 'name' : IDL.Text, 'category' : IDL.Text });
export const Category = IDL.Record({ 'name' : CategoryName });
export const UserProfile = IDL.Record({
  'name' : IDL.Text,
  'restaurantName' : IDL.Text,
});

export const idlService = IDL.Service({});
export const idlInitArgs = [];

export const idlFactory = ({ IDL }) => {
  const CategoryName = IDL.Text;
  const Ingredient = IDL.Record({
    'name' : IDL.Text,
    'category' : CategoryName,
  });
  const Meal = IDL.Record({
    'name' : IDL.Text,
    'ingredients' : IDL.Vec(Ingredient),
  });
  const Timestamp = IDL.Nat;
  const DailyRecord = IDL.Record({
    'meals' : IDL.Vec(Meal),
    'restaurantName' : IDL.Text,
    'timestamp' : Timestamp,
  });
  const Restaurant = IDL.Record({ 'id' : IDL.Text, 'name' : IDL.Text });
  const RestaurantUser = IDL.Record({
    'username' : IDL.Text,
    'password' : IDL.Text,
    'restaurantName' : IDL.Text,
  });
  const MasterCategory = IDL.Record({ 'id' : IDL.Text, 'name' : IDL.Text });
  const RawMaterial = IDL.Record({ 'id' : IDL.Text, 'name' : IDL.Text, 'category' : IDL.Text });
  const Category = IDL.Record({ 'name' : CategoryName });
  const UserProfile = IDL.Record({
    'name' : IDL.Text,
    'restaurantName' : IDL.Text,
  });

  return IDL.Service({
    // Seed
    'seedDefaultData' : IDL.Func([], [], []),
    // Daily records
    'addDailyRecord' : IDL.Func([IDL.Vec(Meal), Timestamp, IDL.Text], [IDL.Nat], []),
    'getAllDailyRecords' : IDL.Func([], [IDL.Vec(DailyRecord)], ['query']),
    // Restaurants
    'getRestaurants' : IDL.Func([], [IDL.Vec(Restaurant)], ['query']),
    'addRestaurant' : IDL.Func([IDL.Text], [], []),
    'updateRestaurant' : IDL.Func([IDL.Text, IDL.Text], [], []),
    'deleteRestaurant' : IDL.Func([IDL.Text], [], []),
    // Users
    'getUsers' : IDL.Func([], [IDL.Vec(RestaurantUser)], ['query']),
    'addUser' : IDL.Func([IDL.Text, IDL.Text, IDL.Text], [], []),
    'updateUser' : IDL.Func([IDL.Text, IDL.Text, IDL.Text], [], []),
    'deleteUser' : IDL.Func([IDL.Text], [], []),
    'verifyUserLogin' : IDL.Func([IDL.Text, IDL.Text], [IDL.Opt(IDL.Text)], ['query']),
    // Categories
    'getCategories' : IDL.Func([], [IDL.Vec(MasterCategory)], ['query']),
    'addCategory' : IDL.Func([IDL.Text], [], []),
    'updateCategory' : IDL.Func([IDL.Text, IDL.Text], [], []),
    'deleteCategory' : IDL.Func([IDL.Text], [], []),
    // Raw materials
    'getRawMaterials' : IDL.Func([], [IDL.Vec(RawMaterial)], ['query']),
    'getRawMaterialsByCategory' : IDL.Func([IDL.Text], [IDL.Vec(RawMaterial)], ['query']),
    'addRawMaterial' : IDL.Func([IDL.Text, IDL.Text], [], []),
    'updateRawMaterial' : IDL.Func([IDL.Text, IDL.Text, IDL.Text], [], []),
    'deleteRawMaterial' : IDL.Func([IDL.Text], [], []),
    // Admin password
    'verifyAdminPassword' : IDL.Func([IDL.Text], [IDL.Bool], ['query']),
    'setAdminPassword' : IDL.Func([IDL.Text], [], []),
    // Legacy
    'getAllCategories' : IDL.Func([], [IDL.Vec(Category)], ['query']),
    'getIngredientsByCategory' : IDL.Func([CategoryName], [IDL.Vec(Ingredient)], ['query']),
  });
};

export const init = ({ IDL }) => { return []; };
