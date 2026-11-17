/**
 * Validate that a user-supplied URL uses a safe HTTP/HTTPS protocol.
 * Blocks dangerous schemes such as `javascript:`, `data:`, or `vbscript:`.
 */
export const isSafeHttpUrl = (rawUrl: unknown): rawUrl is string => {
  if (typeof rawUrl !== 'string') return false;
  const trimmed = rawUrl.trim();
  if (!trimmed || trimmed.length > 2048) return false;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};
