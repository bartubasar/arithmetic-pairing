"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { getSupabase } from "../../src/lib/supabase";

type AuthMode = "signin" | "signup";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getSupabase();

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace("/");
        return;
      }
      setCheckingSession(false);
    });
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    const supabase = getSupabase();

    try {
      if (mode === "signin") {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password
        });

        if (signInError) {
          setError(signInError.message);
          return;
        }

        if (data.session) {
          router.push("/");
        }
      } else {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password
        });

        if (signUpError) {
          setError(signUpError.message);
          return;
        }

        if (data.session) {
          router.push("/");
          return;
        }

        setInfo("Kayıt başarılı. E-posta doğrulaması gerekiyorsa gelen kutunuzu kontrol edin.");
      }
    } finally {
      setLoading(false);
    }
  }

  if (checkingSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-bg-base">
        <p className="text-sm text-ivory-300">Yükleniyor…</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-bg-base px-4 py-10">
      <div className="on-ivory w-full max-w-md rounded-2xl border border-jade-700/40 bg-ivory-50 p-8 shadow-modal">
        <div className="mb-8 text-center">
          <h1 className="font-display text-2xl font-semibold text-jade-800">
            Aritmetik Mahjong
          </h1>
          <p className="mt-2 text-sm text-ink-muted">
            {mode === "signin" ? "Hesabınıza giriş yapın" : "Yeni hesap oluşturun"}
          </p>
        </div>

        <div className="mb-6 flex rounded-lg border border-jade-700/25 bg-ivory-100 p-1">
          <button
            type="button"
            className={`flex-1 rounded-md py-2 text-sm font-semibold transition ${
              mode === "signin"
                ? "bg-jade-600 text-white shadow"
                : "text-jade-800 hover:bg-ivory-50"
            }`}
            onClick={() => {
              setMode("signin");
              setError(null);
              setInfo(null);
            }}
          >
            Giriş Yap
          </button>
          <button
            type="button"
            className={`flex-1 rounded-md py-2 text-sm font-semibold transition ${
              mode === "signup"
                ? "bg-jade-600 text-white shadow"
                : "text-jade-800 hover:bg-ivory-50"
            }`}
            onClick={() => {
              setMode("signup");
              setError(null);
              setInfo(null);
            }}
          >
            Kayıt Ol
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-ink">
              E-posta
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-jade-700/30 bg-white px-3 py-2 text-ink outline-none ring-jade-400 transition placeholder:text-ink-muted/70 focus:ring-2"
              placeholder="ornek@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-ink">
              Şifre
            </label>
            <input
              id="password"
              type="password"
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-jade-700/30 bg-white px-3 py-2 text-ink outline-none ring-jade-400 transition placeholder:text-ink-muted/70 focus:ring-2"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="rounded-lg border border-crimson-400/40 bg-crimson-400/10 px-3 py-2 text-sm text-crimson-500">
              {error}
            </p>
          )}

          {info && (
            <p className="rounded-lg border border-jade-600/30 bg-jade-50 px-3 py-2 text-sm text-jade-800">
              {info}
            </p>
          )}

          <button type="submit" className="btn-primary w-full py-2.5" disabled={loading}>
            {loading ? "İşleniyor…" : mode === "signin" ? "Giriş Yap" : "Kayıt Ol"}
          </button>
        </form>
      </div>
    </main>
  );
}
