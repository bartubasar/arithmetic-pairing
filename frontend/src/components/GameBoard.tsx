"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { expressionForLevel1Tile } from "../data/level1Expressions";
import { checkMatch, fetchLevel } from "../lib/api";
import { findHintPair, getPlayableTileIds } from "../lib/playability";
import type { GameTile, TileVisualState } from "../types/game";
import { Tile } from "./Tile";

const MATCH_SCORE = 10;
const MISMATCH_ANIMATION_MS = 450;
const HINT_DURATION_MS = 3000;

export interface GameBoardProps {
  levelId?: number;
  columns?: number;
  rows?: number;
  isPaused?: boolean;
  hintToken?: number;
  onScoreChange?: (delta: number) => void;
  onLevelMeta?: (meta: { levelName: string; levelDifficulty: string }) => void;
  onWin?: () => void;
}

function layoutToTiles(
  layout: { id: string; grid_col: number; grid_row: number; layer: number }[]
): GameTile[] {
  return layout.map((slot) => ({
    id: slot.id,
    expression: expressionForLevel1Tile(slot.id),
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
  levelId = 1,
  columns = 8,
  rows = 5,
  isPaused = false,
  hintToken = 0,
  onScoreChange,
  onLevelMeta,
  onWin
}: GameBoardProps) {
  const [tiles, setTiles] = useState<GameTile[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [errorIds, setErrorIds] = useState<string[]>([]);
  const [hintIds, setHintIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isMatching, setIsMatching] = useState(false);

  const onWinRef = useRef(onWin);
  onWinRef.current = onWin;

  const playableIds = useMemo(() => getPlayableTileIds(tiles), [tiles]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadLevel() {
      setIsLoading(true);
      setLoadError(null);
      setSelectedIds([]);
      setErrorIds([]);
      setHintIds([]);

      try {
        const level = await fetchLevel(levelId, controller.signal);
        if (controller.signal.aborted) return;

        setTiles(layoutToTiles(level.layout));
        onLevelMeta?.({
          levelName: `Seviye ${level.level_id} — ${level.name} Piramit`,
          levelDifficulty: level.name
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
  }, [levelId, onLevelMeta]);

  useEffect(() => {
    if (hintToken === 0 || isPaused || isLoading || tiles.length === 0) {
      return;
    }

    const pair = findHintPair(tiles, playableIds);
    if (!pair) {
      return;
    }

    setHintIds(pair);
    const timer = window.setTimeout(() => setHintIds([]), HINT_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [hintToken, isPaused, isLoading, tiles, playableIds]);

  useEffect(() => {
    if (isPaused) {
      setSelectedIds([]);
    }
  }, [isPaused]);

  const evaluateMatch = useCallback(
    async (idA: string, idB: string) => {
      const tileA = tiles.find((t) => t.id === idA);
      const tileB = tiles.find((t) => t.id === idB);
      if (!tileA || !tileB) return;

      setIsMatching(true);

      try {
        const { match } = await checkMatch(tileA.expression, tileB.expression);

        if (match) {
          setTiles((prev) => prev.filter((t) => t.id !== idA && t.id !== idB));
          setSelectedIds([]);
          setHintIds((prev) => prev.filter((id) => id !== idA && id !== idB));
          onScoreChange?.(MATCH_SCORE);
        } else {
          setErrorIds([idA, idB]);
          window.setTimeout(() => {
            setErrorIds([]);
            setSelectedIds([]);
          }, MISMATCH_ANIMATION_MS);
        }
      } catch {
        setErrorIds([idA, idB]);
        window.setTimeout(() => {
          setErrorIds([]);
          setSelectedIds([]);
        }, MISMATCH_ANIMATION_MS);
      } finally {
        setIsMatching(false);
      }
    },
    [tiles, onScoreChange]
  );

  const handleTileClick = useCallback(
    (tileId: string) => {
      if (isPaused || isMatching || isLoading) return;
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
    [evaluateMatch, isLoading, isMatching, isPaused, playableIds]
  );

  useEffect(() => {
    if (!isLoading && tiles.length === 0 && !loadError) {
      onWinRef.current?.();
    }
  }, [isLoading, loadError, tiles.length]);

  const sorted = [...tiles].sort((a, b) => a.layer - b.layer);

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
      className={`relative z-board mx-auto w-full max-w-5xl px-4 py-6 ${isPaused ? "pointer-events-none" : ""}`}
      aria-hidden={isPaused}
    >
      <div
        className="relative rounded-2xl border border-jade-700/30 bg-bg-surface/80 p-4 shadow-tile sm:p-6"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${columns}, minmax(0, 4.5rem))`,
          gridTemplateRows: `repeat(${rows}, minmax(4.5rem, auto))`,
          justifyContent: "center",
          gap: "0.5rem"
        }}
      >
        {sorted.map((t) => {
          const state = tileVisualState(t.id, selectedIds, errorIds, hintIds, playableIds);
          const canClick = !isPaused && playableIds.has(t.id);

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
