/**
 * Extract a human-readable message from an unknown error value. Catches the
 * common shapes — Error instances, fetch errors with `message`, plain strings —
 * and falls back to a generic notice rather than leaking `[object Object]`
 * to the UI.
 */
export function errorMessage(err: unknown, fallback = 'Something went wrong'): string {
  if (err instanceof Error) return err.message
  if (typeof err === 'string') return err
  if (err && typeof err === 'object' && 'message' in err) {
    const m = (err as { message: unknown }).message
    if (typeof m === 'string') return m
  }
  return fallback
}
