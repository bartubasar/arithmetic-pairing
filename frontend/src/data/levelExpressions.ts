/**
 * Her seviye: taş sayısı kadar ifade, her sonuç tam 2 taşta (çiftli).
 */
const LEVEL_1: Record<string, string> = {
  t1: "12+4",
  t2: "16",
  t3: "10+5",
  t4: "3*5",
  t5: "9+3",
  t6: "6*2",
  t7: "7+7",
  t8: "20-6",
  t9: "5+5",
  t10: "12-2",
  t11: "9+9",
  t12: "6*3"
};

const LEVEL_2: Record<string, string> = {
  t1: "12+4",
  t2: "16",
  t3: "10+5",
  t4: "3*5",
  t5: "9+3",
  t6: "6*2",
  t7: "7+7",
  t8: "20-6",
  t9: "5+5",
  t10: "12-2",
  t11: "9+9",
  t12: "6*3",
  t13: "10+10",
  t14: "4*5",
  t15: "4+4",
  t16: "16-8",
  t17: "3+3",
  t18: "2*3"
};

const LEVEL_3: Record<string, string> = {
  t1: "12+4",
  t2: "16",
  t3: "10+5",
  t4: "3*5",
  t5: "9+3",
  t6: "6*2",
  t7: "7+7",
  t8: "20-6",
  t9: "5+5",
  t10: "12-2",
  t11: "9+9",
  t12: "6*3",
  t13: "10+10",
  t14: "4*5",
  t15: "4+4",
  t16: "16-8",
  t17: "3+3",
  t18: "2*3",
  t19: "4+5",
  t20: "18-9",
  t21: "3+4",
  t22: "14-7",
  t23: "5+6",
  t24: "22-11"
};

const BY_LEVEL: Record<number, Record<string, string>> = {
  1: LEVEL_1,
  2: LEVEL_2,
  3: LEVEL_3
};

export function expressionForTile(levelId: number, tileId: string): string {
  const map = BY_LEVEL[levelId];
  const expression = map?.[tileId];
  if (!expression) {
    throw new Error(`Seviye ${levelId} için bilinmeyen taş id: ${tileId}`);
  }
  return expression;
}
