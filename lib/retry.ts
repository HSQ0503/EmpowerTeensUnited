import "server-only";

// Postgres serialization failures (P2034) and unique-constraint races (P2002)
// are transient: a retry re-reads the now-committed state and succeeds. Used to
// make read-then-write sequences (e.g. "next session number") concurrency-safe
// without a heavyweight lock.
function isTransientConflict(error: unknown): boolean {
  const code = (error as { code?: string } | null)?.code;
  return code === "P2034" || code === "P2002";
}

export async function withRetry<T>(fn: () => Promise<T>, attempts = 4): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (error) {
      if (!isTransientConflict(error)) throw error;
      lastError = error;
    }
  }
  throw lastError;
}
