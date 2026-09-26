import { describe, it, expect } from "vitest";
import { getStickerRotation, getStickerRotationStyle } from "./stickerRotation";

describe("Deterministic Sticker Rotation (Design System)", () => {
  it("returns identical rotation angles for the same asset ID", () => {
    const id = "asset-cm12345678";
    const rot1 = getStickerRotation(id);
    const rot2 = getStickerRotation(id);
    expect(rot1).toBe(rot2);
  });

  it("returns rotation within the bounded range of -3 to +3 degrees", () => {
    const testIds = ["abc", "xyz", "post-1", "brief-99", "custom-1234-uuid"];
    for (const id of testIds) {
      const rot = getStickerRotation(id);
      expect(rot).toBeGreaterThanOrEqual(-3);
      expect(rot).toBeLessThanOrEqual(3);
    }
  });

  it("returns valid transform style object", () => {
    const style = getStickerRotationStyle("test-id");
    expect(style.transform).toMatch(/^rotate\(-?[0-9.]+deg\)$/);
  });
});
