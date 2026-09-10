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
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.5, ease: "easeOut" } }}
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
            className="flex flex-col items-center px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.4 } }}
            exit={{ opacity: 0, transition: { duration: 0.35 } }}
          >
            <div className="flex justify-center text-white">
              {reduce ? (
                <p className="font-display text-5xl font-semibold tracking-tighter">hello</p>
              ) : (
                <AppleHelloEnglishEffect
                  speed={1.1}
                  onAnimationComplete={() => setAnimDone(true)}
                  className="h-16 text-white sm:h-20"
                />
              )}
            </div>

            <div className="mt-8 flex min-h-[28px] items-center justify-center">
              {canEnter ? (
                <motion.button
                  type="button"
                  onClick={onEnter}
                  initial={reduce ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  autoFocus
                  className="text-sm tracking-wide text-white/60 transition-colors hover:text-white focus-visible:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                >
                  click here to enter
                </motion.button>
              ) : (
                <span className="sr-only">Menyiapkan sapaan…</span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
