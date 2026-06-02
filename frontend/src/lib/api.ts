import type { LevelApiResponse, MatchApiResponse } from "../types/game";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

async function parseJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `API hatası: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function fetchLevel(
  levelId: number,
  signal?: AbortSignal
): Promise<LevelApiResponse> {
  const res = await fetch(`${API_BASE}/api/level/${levelId}`, {
    cache: "no-store",
    signal
  });
  return parseJson<LevelApiResponse>(res);
}

export async function checkMatch(
  expressionA: string,
  expressionB: string
): Promise<MatchApiResponse> {
  const res = await fetch(`${API_BASE}/api/match`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      expression_a: expressionA,
      expression_b: expressionB
    })
  });
  return parseJson<MatchApiResponse>(res);
}
