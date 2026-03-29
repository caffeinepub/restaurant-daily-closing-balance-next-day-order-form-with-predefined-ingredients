import { useState } from "react";

const SESSION_KEY = "hoshnagi_session";

export interface RestaurantSession {
  username: string;
  restaurantName: string;
  password: string;
  availableRestaurants: string[];
}

export function useRestaurantSession() {
  const [session, setSession] = useState<RestaurantSession | null>(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as RestaurantSession;
      if (!parsed.availableRestaurants) {
        parsed.availableRestaurants = [parsed.restaurantName];
      }
      return parsed;
    } catch {
      return null;
    }
  });

  const login = (
    username: string,
    password: string,
    restaurantName: string,
    availableRestaurants: string[] = [restaurantName],
  ) => {
    const s: RestaurantSession = {
      username,
      password,
      restaurantName,
      availableRestaurants,
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(s));
    setSession(s);
  };

  const switchRestaurant = (restaurantName: string) => {
    setSession((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, restaurantName };
      localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
    setSession(null);
  };

  return { session, login, logout, switchRestaurant };
}
