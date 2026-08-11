export function expectArrayResponse<T>(value: unknown, label: string): T[] {
  if (Array.isArray(value)) {
    return value as T[];
  }

  throw new Error(`${label} response was not a list`);
}
