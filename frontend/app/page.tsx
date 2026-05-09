import { GameBoard } from "../src/components/GameBoard";
import { HUD } from "../src/components/HUD";
import { mockGameSession } from "../src/data/mockData";

export default function HomePage() {
  const { levelName, levelDifficulty, score, timeRemainingSec, timeTotalSec, tiles } = mockGameSession;

  return (
    <main className="min-h-screen bg-bg-base">
      <HUD
        levelName={levelName}
        levelDifficulty={levelDifficulty}
        score={score}
        timeRemainingSec={timeRemainingSec}
        timeTotalSec={timeTotalSec}
      />
      <GameBoard tiles={tiles} columns={8} rows={5} />

      <footer className="mx-auto max-w-5xl px-4 pb-10 pt-2 text-center">
        <button type="button" className="btn-primary">
          Oyuna Başla
        </button>
        <p className="mt-4 text-xs text-ivory-300">
          MVP önizleme — veriler mock; backend ve API yok.
        </p>
      </footer>
    </main>
  );
}
