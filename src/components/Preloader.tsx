import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { AppleHelloEnglishEffect } from "./ui/apple-hello-effect";
import { usePreloadAssets } from "../hooks/usePreloadAssets";

type Props = {
  onEnter: () => void;
};

export function Preloader({ onEnter }: Props) {
  const reduce = useReducedMotion();
  const { progress, done } = usePreloadAssets();
  const [animDone, setAnimDone] = useState(reduce ?? false);

  useEffect(() => {
    if (reduce) setAnimDone(true);
  }, [reduce]);

  // lock scroll selama preloader tampil
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // stage terpisah: loading minimal dulu, hello baru muncul setelah aset siap
  const stage = done ? "hello" : "loading";
  const canEnter = done && animDone;

  return (
    <motion.div
      role="status"
      aria-live="polite"
      aria-label="Loading portfolio"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black"
      initial={{ opacity: 1, y: 0 }}
      exit={{ y: "-100%", transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }}
    >
      <AnimatePresence mode="wait">
        {stage === "loading" ? (
          <motion.div
            key="loading"
            className="flex flex-col items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.35 } }}
          >
            {/* ala iPhone boot: layar hitam + bar tipis di tengah */}
            <div
              className="h-[3px] w-[180px] overflow-hidden rounded-full bg-white/15"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progress}
              aria-label="Memuat aset portfolio"
            >
              <div
                className="h-full rounded-full bg-white transition-[width] duration-200 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="sr-only">Memuat… {progress}%</span>
            {/* Katup pengaman: audio 30MB di jaringan lemot bisa lama.
                Fetch yang jalan tetap lanjut ke cache walau user skip duluan. */}
            <button
              type="button"
              onClick={onEnter}
              className="mt-6 text-xs tracking-wide text-white/30 transition-colors hover:text-white/70 focus-visible:text-white/70 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/50"
            >
              Masuk sekarang →
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="hello"
            className="absolute inset-0 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.4 } }}
            // Exit kilat 0.2s: lapisan mahal (backdrop-blur full + gradient + konten)
            // lenyap duluan, lalu root geser 0.8s tinggal bawa layer murah (compositor-only).
            exit={{ opacity: 0, transition: { duration: 0.2, ease: "easeOut" } }}
          >
            {/* bg + kaca full selayar */}
            <img
              src="/bg.png"
              alt=""
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 h-full w-full object-cover"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 border border-white/10 bg-[rgb(20_18_28/0.55)] backdrop-blur-[22px] backdrop-saturate-150"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_70%_18%,rgb(255_138_61/0.14),transparent_42%),radial-gradient(ellipse_70%_50%_at_30%_10%,rgb(74_111_165/0.12),transparent_40%),linear-gradient(180deg,rgb(255_255_255/0.06),transparent_60%)]"
            />
            <div className="relative flex h-full flex-col items-center justify-center px-6">
              <div className="flex justify-center text-white">
                {reduce ? (
                  <p className="font-display text-6xl font-semibold tracking-tighter sm:text-7xl">hello</p>
                ) : (
                  <AppleHelloEnglishEffect
                    speed={1.1}
                    onAnimationComplete={() => setAnimDone(true)}
                    className="h-24 text-white sm:h-32"
                  />
                )}
              </div>

              <div className="mt-8 flex min-h-[28px] items-center justify-center">
                {canEnter ? (
                  <motion.button
                    type="button"
                    onClick={onEnter}
                    initial={reduce ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="rounded-full px-5 py-2 text-[11px] font-medium tracking-widest text-white/50 uppercase transition-all duration-300 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white active:scale-95 sm:px-6 sm:py-2.5 sm:text-xs"
                  >
                    click here to enter
                  </motion.button>
                ) : (
                  <span className="sr-only">Menyiapkan sapaan…</span>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
