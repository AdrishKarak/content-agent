import { describe, it, expect } from "vitest";
import { z } from "zod";
import { cleanAndParseJson, validateSchema } from "./outputValidation";

describe("Output Validation & Clean Parsing", () => {
  const SampleSchema = z.object({
    name: z.string(),
    count: z.number(),
  });

  it("cleans and parses JSON wrapped in markdown fences", () => {
    const raw = '```json\n{"name": "test", "count": 42}\n```';
    const result = cleanAndParseJson(raw, SampleSchema);
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ name: "test", count: 42 });
  });

  it("handles raw JSON without fences", () => {
    const raw = '{"name": "direct", "count": 10}';
    const result = cleanAndParseJson(raw, SampleSchema);
    expect(result.success).toBe(true);
    expect(result.data?.name).toBe("direct");
  });

  it("returns error for invalid JSON syntax", () => {
    const raw = '{"name": "broken", count: ';
    const result = cleanAndParseJson(raw, SampleSchema);
    expect(result.success).toBe(false);
    expect(result.error).toContain("JSON parse error");
  });

  it("returns error when schema validation fails", () => {
    const raw = '{"name": "wrong", "count": "not-a-number"}';
    const result = cleanAndParseJson(raw, SampleSchema);
    expect(result.success).toBe(false);
    expect(result.error).toContain("count");
  });
});
