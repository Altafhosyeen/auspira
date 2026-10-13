export const buildQueryString = (params?: Record<string, unknown>) => {
  const query = new URLSearchParams();

  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (!trimmed) return;
      query.set(key, trimmed);
      return;
    }

    query.set(key, String(value));
  });

  return query.toString();
};
