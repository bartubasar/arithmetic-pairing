import { getSupabase } from "./supabase";

export interface GameSessionRow {
  session_id: string;
  level_id: number;
  status: string;
  final_score_delta: number | null;
  duration_seconds: number | null;
  errors_made: number | null;
  completed_at: string | null;
}

export async function fetchUserGameSessions(userId: string): Promise<GameSessionRow[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("game_sessions")
    .select(
      "session_id, level_id, status, final_score_delta, duration_seconds, errors_made, completed_at"
    )
    .eq("user_id", userId)
    .order("completed_at", { ascending: false })
    .limit(25);

  if (error) {
    console.error("Skor geçmişi yüklenemedi:", error);
    return [];
  }

  return (data ?? []) as GameSessionRow[];
}
