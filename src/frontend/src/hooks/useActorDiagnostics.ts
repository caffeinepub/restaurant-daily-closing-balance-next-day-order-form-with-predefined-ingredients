import { useQuery, useQueryClient } from '@tanstack/react-query';

/**
 * Non-immutable helper hook that inspects actor query state and provides
 * diagnostics and retry functionality without modifying useActor.ts
 */
export function useActorDiagnostics() {
  const queryClient = useQueryClient();
  
  // Get the actor query state directly from the query cache
  const actorQueryState = queryClient.getQueryState(['actor']);
  
  // Determine states based on query status
  const isActorLoading = actorQueryState?.status === 'pending';
  const isActorError = actorQueryState?.status === 'error';
  const isActorReady = actorQueryState?.status === 'success' && !!actorQueryState.data;
  
  // Only show connection error if we've actually tried and failed
  const hasActorError = isActorError;

  const retry = () => {
    // Invalidate the actor query to trigger a refetch
    queryClient.invalidateQueries({ queryKey: ['actor'] });
  };

  return {
    isActorReady,
    isActorLoading,
    hasActorError,
    retry,
  };
}
