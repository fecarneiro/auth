/**
 * Postgres-specific error translation kept at the infrastructure boundary so
 * the driver error code never leaks into the application/domain layers.
 *
 * `23505` is the SQLSTATE for `unique_violation`. It is the real guarantee
 * behind the application-level "already exists" checks, which are only fast,
 * friendly pre-checks and are racy under concurrency.
 */
const UNIQUE_VIOLATION = '23505'

export function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === UNIQUE_VIOLATION
  )
}
