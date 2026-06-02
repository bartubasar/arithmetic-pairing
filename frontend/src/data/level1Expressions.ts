/**
 * Backend layout yalnızca koordinat döndürür; MVP ifadeleri istemcide sabitlenir.
 * Seviye 1 (Kolay) taş id'leri backend ile aynıdır (t1–t12).
 */
export const LEVEL_1_EXPRESSIONS: Record<string, string> = {
  t1: "12+4",
  t2: "8*2",
  t3: "20-4",
  t4: "10+5",
  t5: "3*5",
  t6: "7+8",
  t7: "40-25",
  t8: "9+3",
  t9: "14-2",
  t10: "6*2",
  t11: "11+1",
  t12: "50-38"
};

export function expressionForLevel1Tile(tileId: string): string {
  const expression = LEVEL_1_EXPRESSIONS[tileId];
  if (!expression) {
    throw new Error(`Seviye 1 için bilinmeyen taş id: ${tileId}`);
  }
  return expression;
}
