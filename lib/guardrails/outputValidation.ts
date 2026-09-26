import { z, ZodSchema } from "zod";

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export function validateSchema<T>(schema: ZodSchema<T>, rawData: unknown): ValidationResult<T> {
  const result = schema.safeParse(rawData);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return {
    success: false,
    error: result.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", "),
  };
}

export function cleanAndParseJson<T>(rawText: string, schema: ZodSchema<T>): ValidationResult<T> {
  try {
    const cleaned = rawText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    const parsed = JSON.parse(cleaned);
    return validateSchema(schema, parsed);
  } catch (err: unknown) {
    return {
      success: false,
      error: `JSON parse error: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}
