import { QueryClient } from '@tanstack/react-query'

/** Singleton TanStack Query client with sensible defaults for this app. */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})
