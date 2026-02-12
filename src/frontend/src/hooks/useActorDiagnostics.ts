import { useActor } from './useActor';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Non-immutable helper hook that inspects actor state and provides
 * diagnostics and retry functionality without modifying useActor.ts
 */
export function useActorDiagnostics() {
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();

  const isActorReady = !!actor && !isFetching;
  const hasActorError = !actor && !isFetching; // If not fetching and no actor, assume error

  const retry = () => {
    // Invalidate the actor query to trigger a refetch
    queryClient.invalidateQueries({ queryKey: ['actor'] });
  };

  return {
    isActorReady,
    hasActorError,
    retry,
    actor,
  };
}
