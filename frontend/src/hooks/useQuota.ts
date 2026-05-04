import { useQuery } from '@tanstack/react-query'
import { getQuota } from '../api/client'
import { useAuthStore } from '../stores/auth'

/** Fetches the current user's quota status. Skipped when unauthenticated. */
export function useQuota() {
  const token = useAuthStore((s) => s.token)
  return useQuery({
    queryKey: ['quota'],
    queryFn: getQuota,
    enabled: !!token,
  })
}
