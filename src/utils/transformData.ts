export function transformDataToUpdate(data: Record<string, any>, parentKey: string = ""): Record<string, any> {
  const result: Record<string, any> = {};

 for (const [key, value] of Object.entries(data)) {
    const fullKey = parentKey ? `${parentKey}.${key}` : key;

    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      Object.assign(result, transformDataToUpdate(value, fullKey));
      continue;
    } 
    result[fullKey] = value;

  }

  return result;
}