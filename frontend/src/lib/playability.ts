import { expressionsMatch } from "./expressionEval";
import type { GameTile } from "../types/game";

function hasTileAt(
  tiles: GameTile[],
  col: number,
  row: number,
  layer: number
): boolean {
  return tiles.some(
    (t) => t.gridCol === col && t.gridRow === row && t.layer === layer
  );
}

/** Üstünde (daha yüksek katmanda) taş var mı? */
function isBlockedOnTop(tile: GameTile, tiles: GameTile[]): boolean {
  return tiles.some(
    (other) =>
      other.id !== tile.id &&
      other.gridCol === tile.gridCol &&
      other.gridRow === tile.gridRow &&
      other.layer > tile.layer
  );
}

/** Mahjong kuralı: sol veya sağ komşu boş olmalı (aynı katman). */
function isPlayable(tile: GameTile, tiles: GameTile[]): boolean {
  if (isBlockedOnTop(tile, tiles)) {
    return false;
  }

  const leftBlocked = hasTileAt(tiles, tile.gridCol - 1, tile.gridRow, tile.layer);
  const rightBlocked = hasTileAt(tiles, tile.gridCol + 1, tile.gridRow, tile.layer);

  return !leftBlocked || !rightBlocked;
}

export function getPlayableTileIds(tiles: GameTile[]): Set<string> {
  const ids = new Set<string>();
  for (const tile of tiles) {
    if (isPlayable(tile, tiles)) {
      ids.add(tile.id);
    }
  }
  return ids;
}

/** Tıklanabilir taşlar arasında eşleşen ilk çifti döndürür. */
export function findHintPair(
  tiles: GameTile[],
  playableIds: Set<string>
): [string, string] | null {
  const playable = tiles.filter((t) => playableIds.has(t.id));

  for (let i = 0; i < playable.length; i += 1) {
    for (let j = i + 1; j < playable.length; j += 1) {
      const a = playable[i];
      const b = playable[j];
      if (expressionsMatch(a.expression, b.expression)) {
        return [a.id, b.id];
      }
    }
  }

  return null;
}
