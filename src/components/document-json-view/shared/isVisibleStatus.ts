/**
 * Some extraction pipelines tag rows with internal-only status values (e.g.
 * "Hidden in UI (Collapsed)") that were never meant to reach the rendered
 * document — they're pipeline bookkeeping, not user-facing status. Filter
 * those out before rendering a status badge.
 */
export function isVisibleStatus(status: string | null | undefined): status is string {
  if (!status) return false;
  const normalized = status.trim().toLowerCase();
  if (!normalized) return false;
  return !(normalized.includes('hidden') && normalized.includes('collapsed'));
}
