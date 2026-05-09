import type { MockTile } from "../data/mockData";
import { Tile } from "./Tile";

export interface GameBoardProps {
  tiles: MockTile[];
  columns?: number;
  rows?: number;
}

export function GameBoard({ tiles, columns = 8, rows = 5 }: GameBoardProps) {
  const sorted = [...tiles].sort((a, b) => a.layer - b.layer);

  return (
    <div className="relative z-board mx-auto w-full max-w-5xl px-4 py-6">
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
        {sorted.map((t) => (
          <div
            key={t.id}
            className="flex items-center justify-center"
            style={{
              gridColumnStart: t.gridCol,
              gridRowStart: t.gridRow
            }}
          >
            <Tile expression={t.expression} state={t.state} layer={t.layer} />
          </div>
        ))}
      </div>
    </div>
  );
}
