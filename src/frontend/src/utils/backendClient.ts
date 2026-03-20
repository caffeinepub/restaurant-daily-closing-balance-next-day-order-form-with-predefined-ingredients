import type { backendInterface } from "../backend";
import { createActorWithConfig } from "../config";

let cachedActor: backendInterface | null = null;
let actorPromise: Promise<backendInterface> | null = null;

export async function getAnonActor(): Promise<backendInterface> {
  if (cachedActor) return cachedActor;
  if (actorPromise) return actorPromise;
  actorPromise = createActorWithConfig()
    .then((actor) => {
      cachedActor = actor;
      return cachedActor;
    })
    .catch((err) => {
      actorPromise = null;
      cachedActor = null;
      throw err;
    });
  return actorPromise;
}

export async function getFreshActor(): Promise<backendInterface> {
  resetActorCache();
  return getAnonActor();
}

export function resetActorCache(): void {
  cachedActor = null;
  actorPromise = null;
}
