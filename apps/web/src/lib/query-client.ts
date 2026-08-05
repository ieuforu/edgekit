import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes — data considered fresh
      gcTime: 1000 * 60 * 30, // 30 minutes — keep in cache after unused
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false, // Don't refetch on remount if data is fresh
    },
  },
})
