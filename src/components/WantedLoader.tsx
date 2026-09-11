import { useEffect, useState } from "react";
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";

export const LOADER_TOTAL_MS = 3400;
const PROGRESS_MS = 2800;
const STAMP_AT = 82;

const STATUS = ["Membuka berkas", "Memverifikasi buronan", "Menyiapkan bukti"] as const;

type WantedLoaderProps = {
  onDone: () => void;
};

// Loader fixed 3.4s: kartu dossier + progress + cap stamp merah.
// Tema dikunci: bg paper, tinta ink, satu aksen stamp. Kartu 2px + paper-raised.
export function WantedLoader({ onDone }: WantedLoaderProps) {
  const reduce = useReducedMotion();
  const progress = useMotionValue(0);
  const barScale = useTransform(progress, [0, 100], [0, 1]);
  const [pct, setPct] = useState(0);

  useEffect(() => {
    if (reduce) {
      const t = window.setTimeout(onDone, 300);
      return () => window.clearTimeout(t);
    }

    let lastShown = -1;
    const unsub = progress.on("change", (v) => {
      const floored = Math.floor(v);
      if (floored !== lastShown) {
        lastShown = floored;
        setPct(floored);
      }
    });

    const controls = animate(progress, 100, {
      duration: PROGRESS_MS / 1000,
      ease: [0.16, 1, 0.3, 1],
    });

    const doneTimer = window.setTimeout(onDone, LOADER_TOTAL_MS - 200);

    return () => {
      unsub();
      controls.stop();
      window.clearTimeout(doneTimer);
    };
  }, [onDone, progress, reduce]);

  const status = STATUS[Math.min(Math.floor(pct / 34), STATUS.length - 1)];
  const showStamp = pct >= STAMP_AT;

  return (
    <motion.div
      role="status"
      aria-live="polite"
      aria-label="Memuat berkas Alxyzz"
      className="fixed inset-0 z-[70] flex items-center justify-center bg-paper px-4"
      exit={reduce ? { opacity: 0 } : { y: "-100%" }}
      transition={{ duration: reduce ? 0.2 : 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div
        animate={showStamp && !reduce ? { x: [0, -6, 5, -3, 0] } : { x: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        <div className="paper-raised card-dossier paper-lines relative -rotate-1 bg-paper-card p-6">
          <p className="font-mono text-[11px] font-bold tracking-[0.22em] text-stamp uppercase">
            Wanted: Alxyzz
          </p>
          <p className="font-display mt-3 text-3xl font-extrabold tracking-tighter text-ink uppercase">
            Berkas Kasus
          </p>
          <p className="mt-2 font-mono text-[11px] tracking-[0.18em] text-ink-soft uppercase">
            ALX-2026 · Subang
          </p>

          <div className="mt-6">
            <div
              className="h-3 w-full overflow-hidden border border-ink/25 bg-paper-deep"
              aria-hidden="true"
            >
              <motion.div
                className="h-full w-full origin-left bg-ink"
                style={{ scaleX: reduce ? 1 : barScale }}
              />
            </div>
            <div className="mt-3 flex items-baseline justify-between gap-2">
              <p className="font-mono text-[11px] tracking-[0.18em] text-ink-soft uppercase">
                {status}
                <span className="loading-dots" aria-hidden="true" />
              </p>
              <p className="font-mono text-xs font-bold text-ink tabular-nums">
                {reduce ? 100 : pct}%
              </p>
            </div>
          </div>

          {showStamp && (
            <motion.span
              aria-hidden="true"
              initial={reduce ? { opacity: 1 } : { opacity: 0, scale: 1.5, rotate: -14 }}
              animate={{ opacity: 1, scale: 1, rotate: -8 }}
              transition={{ type: "spring", stiffness: 260, damping: 16 }}
              className="absolute -top-3 -right-2 border-[3px] border-stamp px-3 py-1 font-mono text-sm font-bold tracking-[0.2em] text-stamp uppercase outline-1 outline-stamp outline-offset-2"
            >
              Diburu
            </motion.span>
          )}
        </div>
        <p className="mt-4 text-center font-mono text-[11px] tracking-[0.18em] text-ink-soft uppercase">
          Jangan tutup berkas ini
        </p>
      </motion.div>
    </motion.div>
  );
}
