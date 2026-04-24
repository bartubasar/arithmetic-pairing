export default function HomePage() {
  return (
    <main className="min-h-screen bg-bg-base px-6 py-12">
      <section className="mx-auto max-w-3xl rounded-2xl border border-jade-700/30 bg-bg-surface/90 p-8 shadow-modal">
        <h1 className="font-display text-3xl text-ivory-100">Aritmetik Mahjong</h1>
        <p className="mt-2 text-ivory-300">
          Design system&apos;e uygun ornek Mahjong tasi ve buton:
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-6">
          <button
            type="button"
            className="tile tile-hover tile-selected flex items-center justify-center"
            aria-label="Ornek Mahjong tasi"
          >
            12+4
          </button>

          <button type="button" className="btn-primary">
            Oyuna Basla
          </button>
        </div>
      </section>
    </main>
  );
}
