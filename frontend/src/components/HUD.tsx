"use client";

export interface HUDProps {
  levelName: string;
  levelDifficulty: string;
  score: number;
  timeRemainingSec: number;
  timeTotalSec: number;
  isPaused?: boolean;
  isGameActive?: boolean;
  onPause?: () => void;
  onHint?: () => void;
  onSignOut?: () => void;
  signingOut?: boolean;
  onOpenRules?: () => void;
}

function formatTime(totalSec: number) {
  const s = Math.max(0, Math.floor(totalSec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

export function HUD({
  levelName,
  levelDifficulty,
  score,
  timeRemainingSec,
  timeTotalSec,
  isPaused = false,
  isGameActive = true,
  onPause,
  onHint,
  onSignOut,
  signingOut = false,
  onOpenRules
}: HUDProps) {
  const ratio = timeTotalSec > 0 ? Math.min(1, timeRemainingSec / timeTotalSec) : 0;
  const pct = Math.round(ratio * 100);
  const lowTime = ratio > 0 && ratio < 0.2;
  const controlsDisabled = !isGameActive;

  return (
    <header className="sticky top-0 z-ui border-b border-jade-700/30 bg-bg-surface/90 font-ui backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-sm font-semibold text-gold-200">{levelName}</p>
          <p className="truncate text-xs text-ivory-300">{levelDifficulty}</p>
        </div>

        <div className="flex flex-wrap items-center gap-4 sm:justify-end">
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wide text-ivory-300">Skor</p>
            <p
              className={`font-display text-xl font-semibold tabular-nums ${
                score < 0 ? "text-crimson-400" : "text-gold-300"
              }`}
            >
              {score}
            </p>
          </div>

          <div className="min-w-[140px] flex-1 sm:min-w-[180px] sm:flex-none">
            <div className="flex items-center justify-between gap-2 text-xs text-ivory-100">
              <span className="text-ivory-300">Süre</span>
              <span
                className={
                  lowTime ? "font-semibold tabular-nums text-crimson-400" : "tabular-nums text-ivory-100"
                }
              >
                {formatTime(timeRemainingSec)}
              </span>
            </div>
            <div
              className="mt-1 h-2 w-full overflow-hidden rounded-full border border-jade-700/40 bg-jade-900/50"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={pct}
              aria-label="Kalan süre"
            >
              <div
                className={`h-full rounded-full transition-[width] duration-300 ${
                  lowTime ? "bg-crimson-400" : "bg-jade-500"
                } ${isPaused ? "opacity-60" : ""}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-ivory-400/30 text-sm font-bold text-ivory-300 transition hover:border-ivory-300/50 hover:bg-ivory-50/5 hover:text-ivory-100"
              onClick={() => onOpenRules?.()}
              aria-label="Nasıl oynanır"
              title="Nasıl Oynanır?"
            >
              ?
            </button>
            <button
              type="button"
              className="btn-ghost text-xs sm:text-sm"
              onClick={() => onPause?.()}
              disabled={controlsDisabled}
              aria-pressed={isPaused}
            >
              {isPaused ? "Devam Et" : "Duraklat"}
            </button>
            <button
              type="button"
              className="btn-ghost text-xs sm:text-sm"
              onClick={() => onHint?.()}
              disabled={controlsDisabled || isPaused}
            >
              İpucu
            </button>
            <button
              type="button"
              className="rounded-lg border border-ivory-400/35 bg-transparent px-3 py-2 text-xs font-semibold text-ivory-300 transition hover:border-ivory-300/50 hover:bg-ivory-50/5 hover:text-ivory-100 disabled:opacity-50 sm:text-sm"
              onClick={() => onSignOut?.()}
              disabled={signingOut}
            >
              {signingOut ? "Çıkılıyor…" : "Çıkış Yap"}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
