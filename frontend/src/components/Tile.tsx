import type { TileVisualState } from "../types/game";

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
  locked: "tile-locked",
  error: "ring-2 ring-crimson-400 bg-crimson-400/15 animate-tile-shake",
  hint: "ring-2 ring-gold-200 bg-gold-200/25 shadow-[0_0_22px_6px_rgba(244,216,112,0.75)]"
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
