import type React from "react";

/**
 * Deterministic sticker rotation generator.
 * Derives a consistent rotation angle between -3° and +3° from any string ID.
 * Stable per asset ID so it never jitters on re-render.
 */
export function getStickerRotation(id: string): number {
  if (!id) return 0;
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  // Map hash to range [-3, 3] with 1 decimal precision
  const normalized = (Math.abs(hash) % 61) / 10 - 3;
  return Math.round(normalized * 10) / 10;
}

export function getStickerRotationStyle(id: string): React.CSSProperties {
  const deg = getStickerRotation(id);
  return {
    transform: `rotate(${deg}deg)`,
  };
}
