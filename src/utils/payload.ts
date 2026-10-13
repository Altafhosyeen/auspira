type BuildPayloadOptions<T> = {
  trimStrings?: boolean;
  removeEmpty?: boolean;
  pick?: (keyof T)[];
};

export const buildPayload = <T extends Record<string, any>>(
  data: T,
  options?: BuildPayloadOptions<T>
): Partial<T> => {
  const { trimStrings = true, removeEmpty = false, pick } = options || {};

  return Object.entries(data)
    .filter(([key]) => (pick ? pick.includes(key as keyof T) : true))
    .reduce((acc, [key, value]) => {
      let finalValue = value;

      // Trim strings
      if (trimStrings && typeof finalValue === 'string') {
        finalValue = finalValue.trim();
      }

      // Remove empty values
      if (removeEmpty && (finalValue === '' || finalValue === null || finalValue === undefined)) {
        return acc;
      }

      acc[key as keyof T] = finalValue;
      return acc;
    }, {} as Partial<T>);
};
