export function convertObjectToArray(
  apiResponse: Record<string, any> | undefined
): Array<{ key: string; value: any }> {
  if (!apiResponse) return [];
  return Object.entries(apiResponse).map(([key, value]) => ({ key, value }));
}
