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

function isBlockedOnTop(tile: GameTile, tiles: GameTile[]): boolean {
  return tiles.some(
    (other) =>
      other.id !== tile.id &&
      other.gridCol === tile.gridCol &&
      other.gridRow === tile.gridRow &&
      other.layer > tile.layer
  );
}

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

/** Tıklanabilir taşlar arasında eşleşen ilk çifti döndürür; bulunca hemen durur. */
export function findHintPair(
  tiles: GameTile[],
  playableIds: Set<string>
): [string, string] | null {
  const playable = tiles
    .filter((t) => playableIds.has(t.id))
    .sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));

  for (let i = 0; i < playable.length; i += 1) {
    const a = playable[i];
    for (let j = i + 1; j < playable.length; j += 1) {
      const b = playable[j];
      if (expressionsMatch(a.expression, b.expression)) {
        return [a.id, b.id];
      }
    }
  }

  return null;
}

/** Tıklanabilir taşlar arasında en az bir eşleşen çift var mı? */
export function hasPlayableMatch(tiles: GameTile[]): boolean {
  if (tiles.length === 0) {
    return false;
  }
  const playableIds = getPlayableTileIds(tiles);
  return findHintPair(tiles, playableIds) !== null;
}

function shuffleArray<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Koordinatları koruyarak ifadeleri rastgele yeniden dağıtır. */
export function shuffleTileExpressions(tiles: GameTile[]): GameTile[] {
  const expressions = shuffleArray(tiles.map((t) => t.expression));
  return tiles.map((tile, index) => ({
    ...tile,
    expression: expressions[index] ?? tile.expression
  }));
}

/**
 * Deadlock durumunda ifadeleri karıştırır; mümkünse tıklanabilir bir eşleşme bırakır.
 */
export function shuffleUntilPlayable(
  tiles: GameTile[],
  maxAttempts = 24
): GameTile[] {
  if (tiles.length === 0) {
    return tiles;
  }

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const shuffled = shuffleTileExpressions(tiles);
    if (hasPlayableMatch(shuffled)) {
      return shuffled;
    }
  }

  return shuffleTileExpressions(tiles);
}
