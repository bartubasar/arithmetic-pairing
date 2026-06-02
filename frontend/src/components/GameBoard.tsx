"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { expressionForTile } from "../data/levelExpressions";
import { checkMatch, fetchLevel } from "../lib/api";
import {
  findHintPair,
  getPlayableTileIds,
  hasPlayableMatch,
  shuffleUntilPlayable
} from "../lib/playability";
import type { GameTile, TileVisualState } from "../types/game";
import { Tile } from "./Tile";

const MATCH_SCORE = 10;
const MISMATCH_PENALTY = -25;
const MISMATCH_ANIMATION_MS = 450;
const HINT_DURATION_MS = 3000;
const SHUFFLE_TOAST_MS = 2500;

export interface LevelMeta {
  levelName: string;
  levelDifficulty: string;
  difficultyMultiplier: number;
}

export interface WinStats {
  errors: number;
}

export interface GameBoardProps {
  levelId: number;
  columns?: number;
  rows?: number;
  isPaused?: boolean;
  isGameActive?: boolean;
  hintToken?: number;
  onScoreChange?: (delta: number) => void;
  onLevelMeta?: (meta: LevelMeta) => void;
  onStatsChange?: (stats: WinStats) => void;
  onWin?: (stats: WinStats) => void;
}

function layoutToTiles(
  levelId: number,
  layout: { id: string; grid_col: number; grid_row: number; layer: number }[]
): GameTile[] {
  return layout.map((slot) => ({
    id: slot.id,
    expression: expressionForTile(levelId, slot.id),
    gridCol: slot.grid_col,
    gridRow: slot.grid_row,
    layer: slot.layer
  }));
}

function tileVisualState(
  tileId: string,
  selectedIds: string[],
  errorIds: string[],
  hintIds: string[],
  playableIds: Set<string>
): TileVisualState {
  if (hintIds.includes(tileId)) return "hint";
  if (errorIds.includes(tileId)) return "error";
  if (selectedIds.includes(tileId)) return "selected";
  if (!playableIds.has(tileId)) return "locked";
  return "default";
}

export function GameBoard({
  levelId,
  columns = 8,
  rows,
  isPaused = false,
  isGameActive = true,
  hintToken = 0,
  onScoreChange,
  onLevelMeta,
  onStatsChange,
  onWin
}: GameBoardProps) {
  const gridRows = rows ?? (levelId >= 3 ? 6 : 5);

  const [tiles, setTiles] = useState<GameTile[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [errorIds, setErrorIds] = useState<string[]>([]);
  const [hintIds, setHintIds] = useState<string[]>([]);
  const [errorCount, setErrorCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isMatching, setIsMatching] = useState(false);
  const [shuffleToast, setShuffleToast] = useState(false);

  const tilesRef = useRef(tiles);
  tilesRef.current = tiles;

  const onWinRef = useRef(onWin);
  onWinRef.current = onWin;

  const hasReportedWinRef = useRef(false);
  const moveCountRef = useRef(0);
  const hintTimerRef = useRef<number | null>(null);
  const prevHintTokenRef = useRef(hintToken);

  const clearHintHighlight = useCallback(() => {
    if (hintTimerRef.current !== null) {
      window.clearTimeout(hintTimerRef.current);
      hintTimerRef.current = null;
    }
    setHintIds([]);
  }, []);

  const playableIds = useMemo(() => getPlayableTileIds(tiles), [tiles]);

  useEffect(() => {
    onStatsChange?.({ errors: errorCount });
  }, [errorCount, onStatsChange]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadLevel() {
      clearHintHighlight();
      setIsLoading(true);
      setLoadError(null);
      setSelectedIds([]);
      setErrorIds([]);
      setErrorCount(0);
      setShuffleToast(false);
      hasReportedWinRef.current = false;
      moveCountRef.current = 0;

      try {
        const level = await fetchLevel(levelId, controller.signal);
        if (controller.signal.aborted) return;

        setTiles(layoutToTiles(levelId, level.layout));
        onLevelMeta?.({
          levelName: `Seviye ${level.level_id} — ${level.name} Piramit`,
          levelDifficulty: level.name,
          difficultyMultiplier: level.difficulty_multiplier
        });
      } catch (err) {
        if (controller.signal.aborted) return;
        const message = err instanceof Error ? err.message : "Seviye yüklenemedi.";
        setLoadError(message);
        setTiles([]);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadLevel();
    return () => controller.abort();
  }, [levelId, onLevelMeta, clearHintHighlight]);

  useEffect(() => {
    const tokenIncreased = hintToken > prevHintTokenRef.current;
    prevHintTokenRef.current = hintToken;

    if (!tokenIncreased) {
      return;
    }

    clearHintHighlight();

    if (hintToken === 0 || isPaused || isLoading || !isGameActive) {
      return;
    }

    const currentTiles = tilesRef.current;
    if (currentTiles.length === 0) {
      return;
    }

    const playable = getPlayableTileIds(currentTiles);
    const pair = findHintPair(currentTiles, playable);
    if (!pair) {
      return;
    }

    setHintIds(pair);
    hintTimerRef.current = window.setTimeout(() => {
      setHintIds([]);
      hintTimerRef.current = null;
    }, HINT_DURATION_MS);

    return () => clearHintHighlight();
  }, [hintToken, isPaused, isLoading, isGameActive, clearHintHighlight]);

  useEffect(() => {
    if (isPaused || isLoading || !isGameActive) {
      clearHintHighlight();
    }
  }, [isPaused, isLoading, isGameActive, clearHintHighlight]);

  useEffect(() => () => clearHintHighlight(), [clearHintHighlight]);

  useEffect(() => {
    if (isPaused) {
      setSelectedIds([]);
    }
  }, [isPaused]);

  const checkDeadlockAndShuffle = useCallback((currentTiles: GameTile[]) => {
    if (currentTiles.length === 0) {
      return;
    }
    if (hasPlayableMatch(currentTiles)) {
      return;
    }

    const shuffled = shuffleUntilPlayable(currentTiles);
    setTiles(shuffled);
    setSelectedIds([]);
    setHintIds([]);
    setShuffleToast(true);
    window.setTimeout(() => setShuffleToast(false), SHUFFLE_TOAST_MS);
  }, []);

  const evaluateMatch = useCallback(
    async (idA: string, idB: string) => {
      const tileA = tiles.find((t) => t.id === idA);
      const tileB = tiles.find((t) => t.id === idB);
      if (!tileA || !tileB) return;

      setIsMatching(true);
      moveCountRef.current += 1;

      try {
        const { match } = await checkMatch(tileA.expression, tileB.expression);

        if (match) {
          const nextTiles = tiles.filter((t) => t.id !== idA && t.id !== idB);
          setTiles(nextTiles);
          setSelectedIds([]);
          setHintIds((prev) => prev.filter((id) => id !== idA && id !== idB));
          onScoreChange?.(MATCH_SCORE);
          window.setTimeout(() => checkDeadlockAndShuffle(nextTiles), 0);
        } else {
          setErrorCount((c) => c + 1);
          onScoreChange?.(MISMATCH_PENALTY);
          setErrorIds([idA, idB]);
          window.setTimeout(() => {
            setErrorIds([]);
            setSelectedIds([]);
            checkDeadlockAndShuffle(tilesRef.current);
          }, MISMATCH_ANIMATION_MS);
        }
      } catch {
        setErrorCount((c) => c + 1);
        onScoreChange?.(MISMATCH_PENALTY);
        setErrorIds([idA, idB]);
        window.setTimeout(() => {
          setErrorIds([]);
          setSelectedIds([]);
          checkDeadlockAndShuffle(tilesRef.current);
        }, MISMATCH_ANIMATION_MS);
      } finally {
        setIsMatching(false);
      }
    },
    [tiles, onScoreChange, checkDeadlockAndShuffle]
  );

  const handleTileClick = useCallback(
    (tileId: string) => {
      if (!isGameActive || isPaused || isMatching || isLoading) return;
      if (!playableIds.has(tileId)) return;

      setSelectedIds((prev) => {
        if (prev.includes(tileId)) {
          return prev.filter((id) => id !== tileId);
        }
        if (prev.length === 0) {
          return [tileId];
        }
        if (prev.length === 1 && prev[0] !== tileId) {
          const pair: [string, string] = [prev[0], tileId];
          void evaluateMatch(pair[0], pair[1]);
          return pair;
        }
        return prev;
      });
    },
    [evaluateMatch, isGameActive, isLoading, isMatching, isPaused, playableIds]
  );

  useEffect(() => {
    if (!isLoading && tiles.length === 0 && !loadError && !hasReportedWinRef.current) {
      hasReportedWinRef.current = true;
      onWinRef.current?.({ errors: errorCount });
    }
  }, [isLoading, loadError, tiles.length, errorCount]);

  const sorted = [...tiles].sort((a, b) => a.layer - b.layer);
  const boardLocked = isPaused || !isGameActive;

  if (isLoading) {
    return (
      <div className="relative z-board mx-auto w-full max-w-5xl px-4 py-12 text-center text-ivory-300">
        Tahtalar yükleniyor…
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="relative z-board mx-auto w-full max-w-5xl px-4 py-12 text-center">
        <p className="text-crimson-400">Seviye yüklenemedi.</p>
        <p className="mt-2 text-sm text-ivory-300">{loadError}</p>
        <p className="mt-4 text-xs text-ivory-300">
          Backend&apos;in çalıştığından emin olun:{" "}
          {process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000"}
        </p>
      </div>
    );
  }

  return (
    <div
      className={`relative z-board mx-auto w-full max-w-5xl px-4 py-6 ${boardLocked ? "pointer-events-none" : ""}`}
      aria-hidden={boardLocked}
    >
      {shuffleToast && (
        <div
          className="pointer-events-none absolute left-1/2 top-2 z-toast w-[min(100%,22rem)] -translate-x-1/2 rounded-lg border border-gold-200/50 bg-bg-elevated/95 px-4 py-3 text-center text-sm font-semibold text-gold-200 shadow-modal"
          role="status"
          aria-live="polite"
        >
          Hamle kalmadı, taşlar yeniden karıştırıldı!
        </div>
      )}

      <div
        className="relative rounded-2xl border border-jade-700/30 bg-bg-surface/80 p-4 shadow-tile sm:p-6"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${columns}, minmax(0, 4.5rem))`,
          gridTemplateRows: `repeat(${gridRows}, minmax(4.5rem, auto))`,
          justifyContent: "center",
          gap: "0.5rem"
        }}
      >
        {sorted.map((t) => {
          const state = tileVisualState(t.id, selectedIds, errorIds, hintIds, playableIds);
          const canClick = isGameActive && !isPaused && playableIds.has(t.id);

          return (
            <div
              key={t.id}
              className="flex items-center justify-center"
              style={{
                gridColumnStart: t.gridCol,
                gridRowStart: t.gridRow
              }}
            >
              <Tile
                expression={t.expression}
                state={state}
                layer={t.layer}
                onClick={canClick ? () => handleTileClick(t.id) : undefined}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
