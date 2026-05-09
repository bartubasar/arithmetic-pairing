import type { TileVisualState } from "../data/mockData";

export interface TileProps {
  expression: string;
  state?: TileVisualState;
  layer?: number;
  className?: string;
  onClick?: () => void;
}

const stateClass: Record<TileVisualState, string> = {
  default: "tile-hover",
  selected: "bg-[#fffbe8] shadow-gold-300 animate-tile-select",
  matched: "tile-matched pointer-events-none",
  locked: "tile-locked"
};

export function Tile({
  expression,
  state = "default",
  layer = 0,
  className = "",
  onClick
}: TileProps) {
  const interactive = state !== "locked" && state !== "matched";
  const composed = [
    "tile flex items-center justify-center px-1 text-center text-base leading-tight",
    stateClass[state],
    className
  ]
    .filter(Boolean)
    .join(" ");

  const style = { zIndex: 20 + layer } as const;

  if (interactive && onClick) {
    return (
      <button
        type="button"
        className={composed}
        style={style}
        onClick={onClick}
        aria-pressed={state === "selected"}
        aria-label={`Taş: ${expression}`}
      >
        {expression}
      </button>
    );
  }

  return (
    <div
      className={composed}
      style={style}
      aria-hidden={state === "matched"}
      aria-label={state === "locked" ? `Kilitli taş: ${expression}` : undefined}
    >
      {expression}
    </div>
  );
}
