import { useEffect, useState } from "react";
import type { backendInterface } from "../backend";
import { createActorWithConfig } from "../config";

/**
 * Creates an anonymous backend actor (no Internet Identity required).
 * Used for public/user-level calls.
 */
export function usePublicBackend() {
  const [actor, setActor] = useState<backendInterface | null>(null);

  useEffect(() => {
    let cancelled = false;
    createActorWithConfig()
      .then((a) => {
        if (!cancelled) setActor(a);
      })
      .catch(console.error);
    return () => {
      cancelled = true;
    };
  }, []);

  return { actor };
}
