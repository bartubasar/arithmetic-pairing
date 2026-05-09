export type TileVisualState = "default" | "selected" | "matched" | "locked";

export interface MockTile {
  id: string;
  /** Aritmetik ifade (taş üzerinde gösterilir) */
  expression: string;
  /** Eşleştirme için sonuç değeri */
  result: number;
  gridCol: number;
  gridRow: number;
  layer: number;
  state: TileVisualState;
}

export interface MockGameSession {
  levelName: string;
  levelDifficulty: "Kolay" | "Orta" | "Zor";
  score: number;
  timeRemainingSec: number;
  timeTotalSec: number;
  tiles: MockTile[];
}

/**
 * MVP önizlemesi: sabit piramit benzeri dizilim, çeşitli ifadeler ve durumlar.
 * Sonuçlar en fazla 99 (MVP dokümanı).
 */
export const mockGameSession: MockGameSession = {
  levelName: "Seviye 1 — Kolay Piramit",
  levelDifficulty: "Kolay",
  score: 130,
  timeRemainingSec: 72,
  timeTotalSec: 120,
  tiles: [
    { id: "t1", expression: "12+4", result: 16, gridCol: 4, gridRow: 1, layer: 0, state: "default" },
    { id: "t2", expression: "8*2", result: 16, gridCol: 5, gridRow: 2, layer: 0, state: "selected" },
    { id: "t3", expression: "20-4", result: 16, gridCol: 3, gridRow: 2, layer: 0, state: "default" },
    { id: "t4", expression: "10+5", result: 15, gridCol: 2, gridRow: 3, layer: 0, state: "locked" },
    { id: "t5", expression: "3*5", result: 15, gridCol: 6, gridRow: 3, layer: 0, state: "default" },
    { id: "t6", expression: "7+8", result: 15, gridCol: 4, gridRow: 3, layer: 1, state: "default" },
    { id: "t7", expression: "40-25", result: 15, gridCol: 5, gridRow: 3, layer: 1, state: "default" },
    { id: "t8", expression: "9+3", result: 12, gridCol: 1, gridRow: 4, layer: 0, state: "default" },
    { id: "t9", expression: "14-2", result: 12, gridCol: 7, gridRow: 4, layer: 0, state: "default" },
    { id: "t10", expression: "6*2", result: 12, gridCol: 3, gridRow: 4, layer: 0, state: "matched" },
    { id: "t11", expression: "11+1", result: 12, gridCol: 4, gridRow: 4, layer: 0, state: "default" },
    { id: "t12", expression: "50-38", result: 12, gridCol: 6, gridRow: 4, layer: 0, state: "locked" }
  ]
};
