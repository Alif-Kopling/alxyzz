import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "motion/react";
import {
  ensureDimensionLoaded,
  isDimensionReady,
  markDimensionEntry,
} from "../lib/dimension";
import { playPortalSfx } from "../lib/sfx";
import { lockScroll, unlockScroll } from "./SmoothScroll";
import { useAudio } from "../context/AudioContext";

gsap.registerPlugin(ScrollTrigger);

/**
 * Transisi portal dimensi Project -> Skills.
 * - Pakai CSS sticky (bukan GSAP pin) biar nggak rebutan pin sama
 *   WorkStickyStack & CapabilitiesPan — pola sama kayak ProjectSkillsBridge.
 * - Semua gerakan scrub ngikut scroll: zoom-in ke portal, terbang lewat
 *   terowongan (sambil 3D dipaksa load), zoom-out ke Skills.
 * - Checkpoint 0.65: kalau 3D belum ready, scroll dikunci bentar sampai
 *   ready/timeout, baru dilepas. Char di-mount diam-diam (eager, offscreen,
 *   di balik overlay) jadi pas zoom-out udah nongol instan.
 */
export function PortalTransition() {
  const root = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const enteredRef = useRef(false);
  const lockRef = useRef(false);
  // SFX portal ngikut setting mute/volume musik (selalu di dalam AudioProvider)
  const { muted, volume } = useAudio();
  // simpan terbaru di ref biar closure scrub selalu baca setting saat ini
  const audioRef = useRef({ muted, volume });
  audioRef.current = { muted, volume };

  useEffect(() => {
    if (reduce || !root.current) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const p = self.progress;
            // balik ke atas = reset entry biar suara bisa bunyi lagi pas masuk ulang
            if (p < 0.15) enteredRef.current = false;
            // masuk terowongan: tandai eager + mulai load 3D + bunyikan portal
            if (p > 0.3 && !enteredRef.current) {
              enteredRef.current = true;
              markDimensionEntry();
              playPortalSfx(audioRef.current.muted, audioRef.current.volume);
            }
            // checkpoint: kunci scroll sampai dimensi ready (ada timeout fallback)
            if (p >= 0.65 && !isDimensionReady() && !lockRef.current) {
              lockRef.current = true;
              lockScroll();
              gsap.to(".portal-wait", { opacity: 1, duration: 0.3, overwrite: "auto" });
              void ensureDimensionLoaded().then(() => {
                gsap.to(".portal-wait", { opacity: 0, duration: 0.3, overwrite: "auto" });
                lockRef.current = false;
                unlockScroll();
              });
            }
          },
        },
      });

      // FASE 1 zoom-in (0 - 0.35): cincin muncul dari tengah, glow membesar
      tl.fromTo(".portal-rings", { scale: 0.12, opacity: 0 }, { scale: 0.7, opacity: 1, duration: 0.35 }, 0);
      tl.fromTo(".portal-core", { scale: 0.25, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.35 }, 0);
      tl.fromTo(".portal-hint", { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.15 }, 0.1);

      // FASE 2 terowongan (0.35 - 0.65): cincin nge-scale lewat viewport + streaks muter
      tl.to(".portal-rings", { scale: 3.2, duration: 0.3 }, 0.35);
      tl.to(".portal-core", { scale: 2.4, duration: 0.3 }, 0.35);
      tl.fromTo(".portal-streaks", { opacity: 0, rotation: 0 }, { opacity: 0.8, rotation: 140, duration: 0.45 }, 0.3);
      tl.to(".portal-hint", { opacity: 0, y: -24, duration: 0.12 }, 0.53);

      // FASE 3 zoom-out (0.65 - 1): flash, cincin collapse keluar + fade, streaks hilang
      tl.fromTo(".portal-flash", { opacity: 0 }, { opacity: 0.9, duration: 0.04 }, 0.66);
      tl.to(".portal-flash", { opacity: 0, duration: 0.12 }, 0.7);
      tl.to(".portal-rings", { scale: 5.5, opacity: 0, duration: 0.3 }, 0.68);
      tl.to(".portal-core", { scale: 4, opacity: 0, duration: 0.25 }, 0.68);
      tl.to(".portal-streaks", { opacity: 0, duration: 0.15 }, 0.75);
    }, root);
    return () => {
      ctx.revert();
      // pengaman: jangan pernah ninggalin scroll kekunci
      lockRef.current = false;
      unlockScroll();
    };
  }, [reduce]);

  // Reduced motion: divider statis pendek, tanpa scroll-jacking
  if (reduce) {
    return (
      <section aria-label="Transisi ke skills" className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-500">
          Masuk ke — Skills
        </p>
      </section>
    );
  }

  return (
    <section
      id="portal"
      ref={root}
      aria-hidden="true"
      className="relative h-[280vh] md:h-[300vh]"
    >
      <div className="sticky top-0 flex h-[100dvh] items-center justify-center overflow-hidden bg-[#09090b]">
        {/* streaks terowongan */}
        <div
          className="portal-streaks absolute inset-[-40%] opacity-0"
          style={{
            background:
              "repeating-conic-gradient(from 0deg at 50% 50%, rgb(142 162 255 / 0.16) 0deg 2deg, transparent 2deg 9deg)",
            maskImage: "radial-gradient(circle at 50% 50%, transparent 18%, black 45%, black 72%, transparent 96%)",
            WebkitMaskImage:
              "radial-gradient(circle at 50% 50%, transparent 18%, black 45%, black 72%, transparent 96%)",
          }}
        />
        {/* cincin portal */}
        <div className="portal-rings absolute inset-0 opacity-0">
          <div className="absolute inset-0 m-auto size-[100vmin] rounded-full border border-white/10" />
          <div className="absolute inset-0 m-auto size-[74vmin] rounded-full border border-[#8ea2ff]/25" />
          <div className="absolute inset-0 m-auto size-[52vmin] rounded-full border-2 border-dashed border-[#8ea2ff]/40" />
          <div className="absolute inset-0 m-auto size-[34vmin] rounded-full border-2 border-[#8ea2ff]/70" />
        </div>
        {/* inti portal */}
        <div
          className="portal-core absolute inset-0 m-auto size-[22vmin] rounded-full opacity-0"
          style={{
            background:
              "radial-gradient(circle, rgb(255 255 255 / 0.95) 0%, rgb(142 162 255 / 0.75) 32%, rgb(36 64 255 / 0.35) 58%, transparent 72%)",
            filter: "blur(6px)",
          }}
        />
        {/* flash zoom-out */}
        <div
          className="portal-flash pointer-events-none absolute inset-0 opacity-0"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, rgb(255 255 255 / 0.95), rgb(142 162 255 / 0.5) 55%, transparent 80%)",
          }}
        />

        <p className="portal-hint relative z-10 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-200 opacity-0 backdrop-blur">
          memasuki dimensi…
        </p>
        <p className="portal-wait absolute bottom-10 z-10 animate-pulse rounded-full border border-white/15 bg-white/5 px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-200 opacity-0">
          menyiapkan dimensi…
        </p>
      </div>
    </section>
  );
}
