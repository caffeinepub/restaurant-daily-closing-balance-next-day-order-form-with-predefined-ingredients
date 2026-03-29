import { getAnonActor, getFreshActor, resetActorCache } from "./backendClient";

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

export interface RestaurantAssignment {
  restaurantName: string;
  allowedCategories: string[];
  allowedItems: string[];
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// --- Init ---
export async function initMasterData(): Promise<void> {
  try {
    const actor = await getAnonActor();
    await actor.seedDefaultData();
  } catch {
    // silent — app still works, login will retry independently
    resetActorCache();
  }
}

// --- Emergency credential reset ---
export async function resetToDefaultCredentials(): Promise<void> {
  const actor = await getFreshActor();
  await actor.resetToDefaultCredentials();
}

// --- Admin Password ---
export async function setAdminPassword(newPassword: string): Promise<void> {
  const actor = await getAnonActor();
  await actor.setAdminPassword(newPassword);
}

export async function verifyAdminPassword(password: string): Promise<boolean> {
  const actor = await getAnonActor();
  return actor.verifyAdminPassword(password);
}

// --- Restaurants ---
export async function getRestaurants(): Promise<Restaurant[]> {
  const actor = await getAnonActor();
  return actor.getRestaurants();
}

export async function addRestaurant(name: string): Promise<void> {
  const actor = await getAnonActor();
  await actor.addRestaurant(name);
}

export async function updateRestaurant(
  id: string,
  name: string,
): Promise<void> {
  const actor = await getAnonActor();
  await actor.updateRestaurant(id, name);
}

export async function deleteRestaurant(id: string): Promise<void> {
  const actor = await getAnonActor();
  await actor.deleteRestaurant(id);
}

// --- Users ---
export async function getUsers(): Promise<RestaurantUser[]> {
  const actor = await getAnonActor();
  return actor.getUsers();
}

export async function addUser(
  username: string,
  password: string,
  restaurantName: string,
): Promise<void> {
  const actor = await getAnonActor();
  await actor.addUser(username, password, restaurantName);
}

export async function updateUser(
  username: string,
  newPassword: string,
  restaurantName: string,
): Promise<void> {
  const actor = await getAnonActor();
  await actor.updateUser(username, newPassword, restaurantName);
}

export async function deleteUser(username: string): Promise<void> {
  const actor = await getAnonActor();
  await actor.deleteUser(username);
}

/**
 * Login with automatic retry — tries up to 3 times with a fresh actor
 * each attempt so a single network blip doesn't block the user.
 */
export async function loginUser(
  username: string,
  password: string,
): Promise<RestaurantUser | null> {
  let lastErr: unknown;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      // Always get a fresh actor for login to avoid stale cached connections
      const actor = await getFreshActor();
      // Ensure default users exist — await so they're available before login check
      try {
        await actor.seedDefaultData();
      } catch {
        /* silent */
      }
      const result = await actor.verifyUserLogin(username, password);
      if (result.length > 0) {
        return { username, password: "", restaurantName: result[0] as string };
      }
      return null;
    } catch (err) {
      lastErr = err;
      resetActorCache();
      if (attempt < 2) {
        await sleep(1500 * (attempt + 1));
      }
    }
  }
  throw lastErr;
}

// --- Categories ---
export async function getMasterCategories(): Promise<MasterCategory[]> {
  const actor = await getAnonActor();
  return actor.getCategories();
}

export async function addCategory(name: string): Promise<void> {
  const actor = await getAnonActor();
  await actor.addCategory(name);
}

export async function updateCategory(id: string, name: string): Promise<void> {
  const actor = await getAnonActor();
  await actor.updateCategory(id, name);
}

export async function deleteCategory(id: string): Promise<void> {
  const actor = await getAnonActor();
  await actor.deleteCategory(id);
}

// --- Raw Materials ---
export async function getRawMaterials(): Promise<RawMaterial[]> {
  const actor = await getAnonActor();
  return actor.getRawMaterials();
}

export async function getRawMaterialsByCategory(
  category: string,
): Promise<RawMaterial[]> {
  const actor = await getAnonActor();
  return actor.getRawMaterialsByCategory(category);
}

export async function addRawMaterial(
  name: string,
  category: string,
): Promise<void> {
  const actor = await getAnonActor();
  await actor.addRawMaterial(name, category);
}

export async function updateRawMaterial(
  id: string,
  name: string,
  category: string,
): Promise<void> {
  const actor = await getAnonActor();
  await actor.updateRawMaterial(id, name, category);
}

export async function deleteRawMaterial(id: string): Promise<void> {
  const actor = await getAnonActor();
  await actor.deleteRawMaterial(id);
}

// --- Restaurant Assignments ---
export async function getRestaurantAssignment(
  restaurantName: string,
): Promise<RestaurantAssignment | null> {
  const actor = await getAnonActor();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const actorAny = actor as any;
  const result = await actorAny.getRestaurantAssignment(restaurantName);
  return result && result.length > 0
    ? (result[0] as RestaurantAssignment)
    : null;
}

export async function setRestaurantAssignment(
  restaurantName: string,
  allowedCategories: string[],
  allowedItems: string[],
): Promise<void> {
  const actor = await getAnonActor();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const actorAny = actor as any;
  await actorAny.setRestaurantAssignment(
    restaurantName,
    allowedCategories,
    allowedItems,
  );
}
