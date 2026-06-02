export type TileVisualState =
  | "default"
  | "selected"
  | "matched"
  | "locked"
  | "error"
  | "hint";

export interface GameTile {
  id: string;
  expression: string;
  gridCol: number;
  gridRow: number;
  layer: number;
}

export interface LevelLayoutTile {
  id: string;
  grid_col: number;
  grid_row: number;
  layer: number;
}

export interface LevelApiResponse {
  level_id: number;
  name: string;
  difficulty_multiplier: number;
  layout: LevelLayoutTile[];
}

export interface MatchApiResponse {
  match: boolean;
}
