"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchUserGameSessions, type GameSessionRow } from "../lib/sessions";

export interface LeaderboardProps {
  userId: string;
  refreshKey?: number;
  compact?: boolean;
  title?: string;
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch {
    return "—";
  }
}

function statusLabel(status: string): string {
  if (status === "completed") return "Tamamlandı";
  if (status === "failed") return "Başarısız";
  if (status === "abandoned") return "Bırakıldı";
  return status;
}

export function Leaderboard({
  userId,
  refreshKey = 0,
  compact = false,
  title = "Geçmiş Skorlar"
}: LeaderboardProps) {
  const [rows, setRows] = useState<GameSessionRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await fetchUserGameSessions(userId);
    setRows(data);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    void load();
  }, [load, refreshKey]);

  if (loading) {
    return (
      <p className={`text-ivory-400 ${compact ? "text-xs" : "text-sm"}`}>Skorlar yükleniyor…</p>
    );
  }

  if (rows.length === 0) {
    return (
      <p className={`text-ivory-400 ${compact ? "text-xs" : "text-sm"}`}>
        Henüz kayıtlı oturum yok.
      </p>
    );
  }

  // Tüm zamanların toplam skorunu veritabanından gelen verilerle dinamik hesaplama
  const totalAllTimeScore = rows.reduce((sum, session) => sum + (session.final_score_delta ?? 0), 0);

  return (
    <div className={compact ? "" : "w-full"}>
      <h3
        className={`font-display font-semibold text-ivory-200 ${
          compact ? "mb-2 text-left text-sm" : "mb-3 text-center text-base"
        }`}
      >
        {title}
      </h3>
      <div
        className={`overflow-hidden rounded-lg border border-jade-700/35 bg-bg-surface/60 ${
          compact ? "max-h-48" : "max-h-56"
        } overflow-y-auto`}
      >
        <table className="w-full text-left text-xs text-ivory-200">
          <thead className="sticky top-0 bg-bg-elevated/95 text-[10px] uppercase tracking-wide text-ivory-400">
            <tr>
              <th className="px-3 py-2 font-medium">Bölüm</th>
              <th className="px-3 py-2 font-medium">Skor</th>
              <th className="px-3 py-2 font-medium">Durum</th>
              {!compact && <th className="px-3 py-2 font-medium">Tarih</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const delta = row.final_score_delta ?? 0;
              return (
                <tr
                  key={row.session_id}
                  className="border-t border-jade-700/25 transition hover:bg-jade-900/20"
                >
                  <td className="px-3 py-2 tabular-nums">{row.level_id}</td>
                  <td
                    className={`px-3 py-2 font-semibold tabular-nums ${
                      delta < 0 ? "text-crimson-400" : "text-gold-300"
                    }`}
                  >
                    {delta > 0 ? `+${delta}` : delta}
                  </td>
                  <td className="px-3 py-2 text-ivory-300">{statusLabel(row.status)}</td>
                  {!compact && (
                    <td className="px-3 py-2 text-ivory-400">{formatDate(row.completed_at)}</td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Dinamik Toplam Skor Alanı */}
      <div className="mt-4 flex justify-end">
        <div className="text-right text-[#0c3328] font-bold text-lg px-4 py-2 bg-[#fffff0] border-2 border-[#0c3328] rounded-md shadow-sm">
          Tüm Zamanların Toplam Skoru: {totalAllTimeScore > 0 ? `+${totalAllTimeScore}` : totalAllTimeScore}
        </div>
      </div>
    </div>
  );
}