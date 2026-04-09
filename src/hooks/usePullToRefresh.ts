import { useCallback, useState } from 'react'
import { useQueryClient, type QueryKey } from '@tanstack/react-query'

/**
 * Web fallback for pull-to-refresh semantics.
 * Trigger `onRefresh` from an explicit refresh affordance.
 */
export function usePullToRefresh(queryKeys: QueryKey[]) {
  const queryClient = useQueryClient()
  const [refreshing, setRefreshing] = useState(false)

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      await Promise.all(
        queryKeys.map((key) => queryClient.invalidateQueries({ queryKey: key })),
      )
    } finally {
      setRefreshing(false)
    }
  }, [queryClient, queryKeys])

  return { refreshing, onRefresh }
}
