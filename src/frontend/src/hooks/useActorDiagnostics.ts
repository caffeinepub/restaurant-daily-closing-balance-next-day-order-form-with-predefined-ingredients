import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

/**
 * Non-immutable helper hook that inspects actor query state and provides
 * diagnostics and retry functionality without modifying useActor.ts
 */
export function useActorDiagnostics() {
  const queryClient = useQueryClient();
  const [diagnostics, setDiagnostics] = useState({
    isActorReady: false,
    isActorLoading: false,
    hasActorError: false,
  });

  useEffect(() => {
    // Subscribe to query cache changes to reactively update diagnostics
    const unsubscribe = queryClient.getQueryCache().subscribe(() => {
      // Find any actor query (with or without identity in the key)
      const queries = queryClient.getQueryCache().findAll({
        predicate: (query) => {
          const key = query.queryKey;
          return Array.isArray(key) && key[0] === 'actor';
        },
      });

      // Use the first matching actor query (there should only be one active)
      const actorQuery = queries[0];

      if (actorQuery) {
        const state = actorQuery.state;
        setDiagnostics({
          isActorReady: state.status === 'success' && !!state.data,
          isActorLoading: state.status === 'pending',
          hasActorError: state.status === 'error',
        });
      } else {
        // No actor query found yet
        setDiagnostics({
          isActorReady: false,
          isActorLoading: true,
          hasActorError: false,
        });
      }
    });

    return unsubscribe;
  }, [queryClient]);

  const retry = () => {
    // Invalidate all actor queries (regardless of identity in key)
    queryClient.invalidateQueries({
      predicate: (query) => {
        const key = query.queryKey;
        return Array.isArray(key) && key[0] === 'actor';
      },
    });
  };

  return {
    isActorReady: diagnostics.isActorReady,
    isActorLoading: diagnostics.isActorLoading,
    hasActorError: diagnostics.hasActorError,
    retry,
  };
}
