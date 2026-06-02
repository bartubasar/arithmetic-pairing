"use client";

import { useCallback, useEffect, useState } from "react";
import { GameBoard } from "../src/components/GameBoard";
import { HUD } from "../src/components/HUD";

const TIME_TOTAL_SEC = 120;

export default function HomePage() {
  const [score, setScore] = useState(0);
  const [levelName, setLevelName] = useState("Yükleniyor…");
  const [levelDifficulty, setLevelDifficulty] = useState("");
  const [timeRemainingSec, setTimeRemainingSec] = useState(TIME_TOTAL_SEC);
  const [won, setWon] = useState(false);

  const handleScoreChange = useCallback((delta: number) => {
    setScore((prev) => prev + delta);
  }, []);

  const handleLevelMeta = useCallback(
    (meta: { levelName: string; levelDifficulty: string }) => {
      setLevelName(meta.levelName);
      setLevelDifficulty(meta.levelDifficulty);
      setWon(false);
      setTimeRemainingSec(TIME_TOTAL_SEC);
    },
    []
  );

  const handleWin = useCallback(() => {
    setWon(true);
  }, []);

  const handleRestart = useCallback(() => {
    setScore(0);
    setWon(false);
    setTimeRemainingSec(TIME_TOTAL_SEC);
    window.location.reload();
  }, []);

  useEffect(() => {
    if (won) return;

    const timer = window.setInterval(() => {
      setTimeRemainingSec((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [won]);

  return (
    <main className="min-h-screen bg-bg-base">
      <HUD
        levelName={levelName}
        levelDifficulty={levelDifficulty}
        score={score}
        timeRemainingSec={timeRemainingSec}
        timeTotalSec={TIME_TOTAL_SEC}
      />
      <GameBoard
        levelId={1}
        onScoreChange={handleScoreChange}
        onLevelMeta={handleLevelMeta}
        onWin={handleWin}
      />

      {won && (
        <div
          className="fixed inset-0 z-modal flex items-center justify-center bg-black/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="win-title"
        >
          <div className="animate-modal-up w-full max-w-sm rounded-2xl border border-gold-200/40 bg-bg-elevated p-6 text-center shadow-modal">
            <h2 id="win-title" className="font-display text-2xl font-semibold text-gold-200">
              Kazandın!
            </h2>
            <p className="mt-2 text-ivory-300">Skorun: {score}</p>
            <button type="button" className="btn-gold mt-6 w-full" onClick={handleRestart}>
              Yeniden Oyna
            </button>
          </div>
        </div>
      )}

      <footer className="mx-auto max-w-5xl px-4 pb-10 pt-2 text-center">
        <p className="text-xs text-ivory-300">
          Backend: {process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000"}
        </p>
      </footer>
    </main>
  );
}
