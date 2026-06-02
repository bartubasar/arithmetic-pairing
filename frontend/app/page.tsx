"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { LevelMeta, WinStats } from "../src/components/GameBoard";
import { GameBoard } from "../src/components/GameBoard";
import { HowToPlayModal } from "../src/components/HowToPlayModal";
import { HUD } from "../src/components/HUD";
import { Leaderboard } from "../src/components/Leaderboard";
import { endSession } from "../src/lib/api";
import { getSupabase } from "../src/lib/supabase";

const TIME_TOTAL_SEC = 120;
const MAX_LEVEL = 3;
const HINT_PENALTY = -10;
function howToPlayStorageKey(userId: string) {
  return `hasSeenHowToPlay_${userId}`;
}

type SessionStatus = "completed" | "failed";

export default function HomePage() {
  const router = useRouter();
  const [authChecking, setAuthChecking] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [levelId, setLevelId] = useState(1);
  const [boardKey, setBoardKey] = useState(0);
  const [score, setScore] = useState(0);
  const [levelName, setLevelName] = useState("Yükleniyor…");
  const [levelDifficulty, setLevelDifficulty] = useState("");
  const [difficultyMultiplier, setDifficultyMultiplier] = useState(1);
  const [timeRemainingSec, setTimeRemainingSec] = useState(TIME_TOTAL_SEC);
  const [won, setWon] = useState(false);
  const [failed, setFailed] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isGameActive, setIsGameActive] = useState(false);
  const [hintToken, setHintToken] = useState(0);
  const [lastLevelFinalScore, setLastLevelFinalScore] = useState(0);
  const [sessionSaving, setSessionSaving] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [leaderboardRefreshKey, setLeaderboardRefreshKey] = useState(0);

  const scoreRef = useRef(score);
  const timeRemainingRef = useRef(timeRemainingSec);
  const levelIdRef = useRef(levelId);
  const difficultyRef = useRef(difficultyMultiplier);
  const errorCountRef = useRef(0);
  const hasReportedTimeUpRef = useRef(false);
  const userIdRef = useRef<string | null>(null);

  userIdRef.current = userId;
  scoreRef.current = score;
  timeRemainingRef.current = timeRemainingSec;
  levelIdRef.current = levelId;
  difficultyRef.current = difficultyMultiplier;

  useEffect(() => {
    const supabase = getSupabase();

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace("/login");
        return;
      }
      setUserId(session.user.id);
      setAuthChecking(false);
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setUserId(null);
        router.replace("/login");
        return;
      }
      setUserId(session.user.id);
      setAuthChecking(false);
    });

    return () => subscription.unsubscribe();
  }, [router]);

  useEffect(() => {
    if (authChecking || !userId) return;

    const seen = window.localStorage.getItem(howToPlayStorageKey(userId));
    if (!seen) {
      setShowRulesModal(true);
    }
  }, [authChecking, userId]);

  const openRulesModal = useCallback(() => {
    setShowRulesModal(true);
  }, []);

  const closeRulesModal = useCallback(() => {
    if (userId) {
      window.localStorage.setItem(howToPlayStorageKey(userId), "1");
    }
    setShowRulesModal(false);
  }, [userId]);

  const applyScoreDelta = useCallback((delta: number) => {
    setScore((prev) => prev + delta);
  }, []);

  const handleStatsChange = useCallback((stats: WinStats) => {
    errorCountRef.current = stats.errors;
  }, []);

  const resetHintState = useCallback(() => {
    setHintToken(0);
  }, []);

  const handleLevelMeta = useCallback((meta: LevelMeta) => {
    setLevelName(meta.levelName);
    setLevelDifficulty(meta.levelDifficulty);
    setDifficultyMultiplier(meta.difficultyMultiplier);
    setWon(false);
    setFailed(false);
    setGameComplete(false);
    setIsPaused(false);
    setIsGameActive(true);
    setTimeRemainingSec(TIME_TOTAL_SEC);
    hasReportedTimeUpRef.current = false;
    resetHintState();
  }, [resetHintState]);

  const saveSession = useCallback(
    async (stats: WinStats, status: SessionStatus) => {
      const activeUserId = userIdRef.current;
      if (!activeUserId) {
        console.error("Oturum kaydedilemedi: kullanıcı kimliği yok.");
        return 0;
      }

      const rawScore = scoreRef.current;
      const multiplier = difficultyRef.current;
      const finalScore = Math.round(rawScore * multiplier);
      const duration = TIME_TOTAL_SEC - timeRemainingRef.current;

      setLastLevelFinalScore(finalScore);
      setSessionSaving(true);

      try {
        await endSession({
          user_id: activeUserId,
          level_id: levelIdRef.current,
          status,
          duration,
          errors: stats.errors,
          final_score: finalScore
        });
      } catch (err) {
        console.error("Oturum kaydedilemedi:", err);
      } finally {
        setSessionSaving(false);
        setLeaderboardRefreshKey((k) => k + 1);
      }

      return finalScore;
    },
    []
  );

  const handleWin = useCallback(
    async (stats: WinStats) => {
      await saveSession(stats, "completed");
      setWon(true);
      setFailed(false);
      setIsPaused(false);
      setIsGameActive(false);
      if (levelIdRef.current >= MAX_LEVEL) {
        setGameComplete(true);
      }
    },
    [saveSession]
  );

  const handleTimeUp = useCallback(async () => {
    if (hasReportedTimeUpRef.current || won) {
      return;
    }
    hasReportedTimeUpRef.current = true;
    setIsGameActive(false);
    setIsPaused(false);
    await saveSession({ errors: errorCountRef.current }, "failed");
    setFailed(true);
  }, [saveSession, won]);

  useEffect(() => {
    if (
      timeRemainingSec === 0 &&
      isGameActive &&
      !won &&
      !failed &&
      !hasReportedTimeUpRef.current
    ) {
      void handleTimeUp();
    }
  }, [timeRemainingSec, isGameActive, won, failed, handleTimeUp]);

  const togglePause = useCallback(() => {
    if (!isGameActive || won || failed) return;
    setIsPaused((prev) => !prev);
  }, [isGameActive, won, failed]);

  const handleHint = useCallback(() => {
    if (!isGameActive || won || failed || isPaused) return;
    applyScoreDelta(HINT_PENALTY);
    setHintToken((t) => t + 1);
  }, [isGameActive, isPaused, won, failed, applyScoreDelta]);

  const handleSignOut = useCallback(async () => {
    setSigningOut(true);
    try {
      await getSupabase().auth.signOut();
      router.push("/login");
    } catch (err) {
      console.error("Çıkış yapılamadı:", err);
      setSigningOut(false);
    }
  }, [router]);

  const handleNextLevel = useCallback(() => {
    if (levelId >= MAX_LEVEL) return;
    resetHintState();
    setWon(false);
    setFailed(false);
    setIsPaused(false);
    setIsGameActive(true);
    setTimeRemainingSec(TIME_TOTAL_SEC);
    hasReportedTimeUpRef.current = false;
    setBoardKey((k) => k + 1);
    setLevelId((prev) => prev + 1);
  }, [levelId, resetHintState]);

  const handleRetryLevel = useCallback(() => {
    resetHintState();
    setWon(false);
    setFailed(false);
    setIsPaused(false);
    setIsGameActive(true);
    setTimeRemainingSec(TIME_TOTAL_SEC);
    hasReportedTimeUpRef.current = false;
    setBoardKey((k) => k + 1);
  }, [resetHintState]);

  const handleRestart = useCallback(() => {
    resetHintState();
    setLevelId(1);
    setBoardKey((k) => k + 1);
    setScore(0);
    setWon(false);
    setFailed(false);
    setGameComplete(false);
    setIsPaused(false);
    setIsGameActive(false);
    setTimeRemainingSec(TIME_TOTAL_SEC);
    setLastLevelFinalScore(0);
    setDifficultyMultiplier(1);
    setLevelName("Yükleniyor…");
    setLevelDifficulty("");
    hasReportedTimeUpRef.current = false;
    errorCountRef.current = 0;
  }, [resetHintState]);

  useEffect(() => {
    if (won || failed || isPaused || showRulesModal || !isGameActive) return;

    const timer = window.setInterval(() => {
      setTimeRemainingSec((prev) => {
        if (prev > 0) {
          setScore((s) => s - 1);
          return prev - 1;
        }
        return 0;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [won, failed, isPaused, showRulesModal, isGameActive]);

  const showEndModal = won || failed;

  if (authChecking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-bg-base">
        <p className="text-sm text-ivory-300">Oturum kontrol ediliyor…</p>
      </main>
    );
  }

  if (!userId) {
    return null;
  }

  return (
    <main className="min-h-screen bg-bg-base">
      <HowToPlayModal open={showRulesModal} onClose={closeRulesModal} />

      <HUD
        levelName={levelName}
        levelDifficulty={levelDifficulty}
        score={score}
        timeRemainingSec={timeRemainingSec}
        timeTotalSec={TIME_TOTAL_SEC}
        isPaused={isPaused}
        isGameActive={isGameActive}
        onPause={togglePause}
        onHint={handleHint}
        onSignOut={handleSignOut}
        signingOut={signingOut}
        onOpenRules={openRulesModal}
      />
      <GameBoard
        key={`${levelId}-${boardKey}`}
        levelId={levelId}
        isPaused={isPaused || showRulesModal}
        isGameActive={isGameActive && !showRulesModal}
        hintToken={hintToken}
        onScoreChange={applyScoreDelta}
        onLevelMeta={handleLevelMeta}
        onStatsChange={handleStatsChange}
        onWin={handleWin}
      />

      {isPaused && isGameActive && !showEndModal && (
        <div
          className="fixed inset-0 z-overlay flex items-center justify-center bg-black/55 p-4 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pause-title"
        >
          <div className="animate-modal-up w-full max-w-sm rounded-2xl border border-jade-500/50 bg-bg-elevated/95 px-6 py-8 text-center shadow-modal">
            <h2 id="pause-title" className="font-display text-2xl font-semibold text-ivory-100">
              Oyun Duraklatıldı
            </h2>
            <p className="mt-2 text-sm text-ivory-300">Devam etmek için aşağıdaki butona basın.</p>
            <button type="button" className="btn-primary mt-6 w-full" onClick={togglePause}>
              Devam Et
            </button>
          </div>
        </div>
      )}

      {failed && (
        <div
          className="fixed inset-0 z-modal flex items-center justify-center bg-black/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="fail-title"
        >
          <div className="animate-modal-up w-full max-w-sm rounded-2xl border border-crimson-400/40 bg-bg-elevated p-6 text-center shadow-modal">
            <h2 id="fail-title" className="font-display text-2xl font-semibold text-crimson-400">
              Süre Doldu — Başarısız Oldunuz
            </h2>
            <p className="mt-2 text-ivory-300">
              Bölüm skoru: {lastLevelFinalScore}{" "}
              <span className="text-ivory-400">(×{difficultyMultiplier} çarpan)</span>
            </p>
            <p className="mt-1 text-sm text-ivory-400">
              Toplam skor: {score}
              {sessionSaving && " · Kaydediliyor…"}
            </p>
            <button
              type="button"
              className="btn-primary mt-6 w-full"
              onClick={handleRetryLevel}
              disabled={sessionSaving}
            >
              Yeniden Dene
            </button>
          </div>
        </div>
      )}

      {won && (
        <div
          className="fixed inset-0 z-modal flex items-center justify-center bg-black/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="win-title"
        >
          <div
            className={`animate-modal-up w-full rounded-2xl border border-gold-200/40 bg-bg-elevated p-6 shadow-modal ${
              gameComplete ? "max-w-md text-left" : "max-w-sm text-center"
            }`}
          >
            {gameComplete ? (
              <>
                <h2
                  id="win-title"
                  className="text-center font-display text-2xl font-semibold text-gold-200"
                >
                  Oyunu Tamamen Bitirdiniz!
                </h2>
                <p className="mt-2 text-center text-ivory-300">
                  Tüm bölümleri tamamladınız. Tebrikler!
                </p>
                <div className="mt-5">
                  <Leaderboard
                    userId={userId}
                    refreshKey={leaderboardRefreshKey}
                    title="Geçmiş Oturum Skorları"
                  />
                </div>
              </>
            ) : (
              <>
                <h2 id="win-title" className="font-display text-2xl font-semibold text-gold-200">
                  Kazandın!
                </h2>
                <p className="mt-2 text-ivory-300">
                  Bölüm skoru: {lastLevelFinalScore}{" "}
                  <span className="text-ivory-400">(×{difficultyMultiplier} çarpan)</span>
                </p>
              </>
            )}
            <p className="mt-1 text-sm text-ivory-400">
              Toplam skor: {score}
              {sessionSaving && " · Kaydediliyor…"}
            </p>

            <div className="mt-6 flex flex-col gap-2">
              {!gameComplete && (
                <button
                  type="button"
                  className="btn-gold w-full"
                  onClick={handleNextLevel}
                  disabled={sessionSaving}
                >
                  Sonraki Bölüm
                </button>
              )}
              <button type="button" className="btn-primary w-full" onClick={handleRestart}>
                {gameComplete ? "Baştan Oyna" : "Yeniden Başla"}
              </button>
            </div>
          </div>
        </div>
      )}

      {!showEndModal && (
        <aside className="mx-auto max-w-5xl px-4 pb-6">
          <div className="rounded-xl border border-jade-700/30 bg-bg-surface/50 p-4">
            <Leaderboard
              userId={userId}
              refreshKey={leaderboardRefreshKey}
              compact
              title="Skor Geçmişi"
            />
          </div>
        </aside>
      )}

      <footer className="mx-auto max-w-5xl px-4 pb-10 pt-2 text-center">
        <p className="text-xs text-ivory-300">
          Bölüm {levelId}/{MAX_LEVEL} · Backend:{" "}
          {process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000"}
        </p>
      </footer>
    </main>
  );
}
