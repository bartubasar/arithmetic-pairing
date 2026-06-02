"use client";

export interface HowToPlayModalProps {
  open: boolean;
  onClose: () => void;
}

const RULES = [
  "Eşit sonuçları veren taşları eşleştirin.",
  "Sadece üstü ve en az bir yan kenarı açık olan taşları seçebilirsiniz (Mahjong Kuralı).",
  "Hatalı eşleşmeler −25, ipucu kullanımı −10 puan kaybettirir ve süre akarken puanınız azalır."
];

export function HowToPlayModal({ open, onClose }: HowToPlayModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-modal flex items-center justify-center bg-black/55 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="howto-title"
    >
      <div className="on-ivory animate-modal-up w-full max-w-md rounded-2xl border border-jade-700/40 bg-ivory-50 p-6 shadow-modal">
        <h2
          id="howto-title"
          className="font-display text-xl font-semibold text-jade-800"
        >
          Nasıl Oynanır?
        </h2>
        <ul className="mt-4 space-y-3 text-sm leading-relaxed text-jade-800">
          {RULES.map((rule) => (
            <li key={rule} className="flex gap-2">
              <span
                className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-jade-600"
                aria-hidden
              />
              <span className="text-ink">{rule}</span>
            </li>
          ))}
        </ul>
        <button type="button" className="btn-primary mt-6 w-full" onClick={onClose}>
          Oyuna Başla
        </button>
      </div>
    </div>
  );
}
