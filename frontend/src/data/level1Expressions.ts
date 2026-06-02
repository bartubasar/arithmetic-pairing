/**
 * Seviye 1 (Kolay) — 12 taş, 6 çift.
 * Her matematiksel sonuç tam 2 taşta görünür (yetim taş yok).
 */
export const LEVEL_1_EXPRESSIONS: Record<string, string> = {
  // Sonuç 16
  t1: "12+4",
  t2: "16",
  // Sonuç 15
  t3: "10+5",
  t4: "3*5",
  // Sonuç 12
  t5: "9+3",
  t6: "6*2",
  // Sonuç 14
  t7: "7+7",
  t8: "20-6",
  // Sonuç 10
  t9: "5+5",
  t10: "12-2",
  // Sonuç 18
  t11: "9+9",
  t12: "6*3"
};

export const LEVEL_1_TILE_IDS = Object.keys(LEVEL_1_EXPRESSIONS);

export function expressionForLevel1Tile(tileId: string): string {
  const expression = LEVEL_1_EXPRESSIONS[tileId];
  if (!expression) {
    throw new Error(`Seviye 1 için bilinmeyen taş id: ${tileId}`);
  }
  return expression;
}
