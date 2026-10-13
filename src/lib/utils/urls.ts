const DEFAULT_FALLBACK_BASE = 'http://localhost';

const resolveFallbackBase = (): string => {
  const configuredBase = process.env.NEXT_PUBLIC_BACKEND_URL?.trim();
  if (configuredBase) {
    try {
      return new URL(configuredBase).origin;
    } catch {
      // Ignore invalid env base and continue with runtime/default fallback.
    }
  }

  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }

  return DEFAULT_FALLBACK_BASE;
};

const normalizePath = (pathname: string): string => {
  const normalized = pathname.replace(/^\/+/, '').replace(/\/+/g, '/').trim();
  if (!normalized) {
    return '';
  }

  return normalized.endsWith('/') ? normalized : `${normalized}/`;
};

export const getCleanUrl = (inputUrl: string): string => {
  const rawInput = inputUrl?.trim() ?? '';
  if (!rawInput) {
    return '';
  }

  try {
    const parsed = new URL(rawInput, resolveFallbackBase());
    return normalizePath(parsed.pathname);
  } catch {
    // Best-effort extraction when URL parsing fails due to malformed input.
    const withoutOrigin = rawInput.replace(/^[a-z][a-z\d+.-]*:\/\/[^/]+/i, '');
    const pathOnly = withoutOrigin.split('?')[0]?.split('#')[0] ?? '';
    return normalizePath(pathOnly);
  }
};
