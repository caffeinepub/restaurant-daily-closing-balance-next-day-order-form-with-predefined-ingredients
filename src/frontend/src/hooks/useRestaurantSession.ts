import { useState } from "react";

const SESSION_KEY = "hoshnagi_session";

export interface RestaurantSession {
  username: string;
  restaurantName: string;
  password: string;
}

export function useRestaurantSession() {
  const [session, setSession] = useState<RestaurantSession | null>(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      return raw ? (JSON.parse(raw) as RestaurantSession) : null;
    } catch {
      return null;
    }
  });

  const login = (
    username: string,
    password: string,
    restaurantName: string,
  ) => {
    const s: RestaurantSession = { username, password, restaurantName };
    localStorage.setItem(SESSION_KEY, JSON.stringify(s));
    setSession(s);
  };

  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
    setSession(null);
  };

  return { session, login, logout };
}
