import { createActorWithConfig as _createActorWithConfig } from "@caffeineai/core-infrastructure";
import type { backendInterface } from "../backend";
import { createActor } from "../backend";

/**
 * Creates the backend actor using the Caffeine infrastructure config.
 * This wires the generated `createActor` from backend.ts to the
 * platform's canister ID and storage configuration.
 */
export async function createActorWithConfig(): Promise<backendInterface> {
  return _createActorWithConfig(createActor);
}

export { loadConfig } from "@caffeineai/core-infrastructure";
