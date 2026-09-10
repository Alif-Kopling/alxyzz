import { useEffect } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Satu instance untuk seluruh app. Komponen lain navigasi lewat scrollToId()
// biar otomatis pakai Lenis kalau aktif, fallback native kalau tidak.
let lenis: Lenis | null = null;

/** Berat sedang: makin kecil lerp makin berat. 0.09 = halus tapi berisi. */
const LERP = 0.09;
/** Berat di dalam portal: 3x lebih berat, kayak ketahan dimensi lain. */
const HEAVY_LERP = 0.03;
/** Samain sama scroll-mt-20 (80px) biar mendarat di bawah navbar. */
const NAV_OFFSET = 80;

export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  if (lenis) {
    lenis.scrollTo(el, { offset: NAV_OFFSET, duration: 1.4 });
  } else {
    el.scrollIntoView({ behavior: "smooth" });
  }
}

/** Kunci scroll (dipakai checkpoint portal saat nunggu 3D ready). */
export function lockScroll() {
  lenis?.stop();
}

/** Lepas kunci scroll. */
export function unlockScroll() {
  lenis?.start();
}

/**
 * Bikin scroll berat sementara (dipakai di dalam portal).
 * Lenis baca options.lerp live tiap wheel event, jadi aman diubah on-the-fly.
 * Touch HP native (syncTouch mati) jadi tidak terpengaruh.
 */
export function setScrollHeavy(heavy: boolean) {
  if (!lenis) return;
  try {
    (lenis as unknown as { options: { lerp: number } }).options.lerp =
      heavy ? HEAVY_LERP : LERP;
  } catch {
    /* abaikan */
  }
}

/**
 * Scroll berat/pelan seluruh halaman (wheel + trackpad; touch HP tetap native).
 * - raf jalan di GSAP ticker (autoRaf mati) biar sinkron sama semua pin/scrub.
 * - anchors: true → semua href="#..." otomatis smooth + offset navbar.
 * - prefers-reduced-motion ditangani Lenis sendiri (smoothing mati, lompat instan).
 * Mount hanya setelah preloader selesai (lihat App) biar pin-spacer keukur benar.
 */
export function SmoothScroll() {
  useEffect(() => {
    const instance = new Lenis({
      lerp: LERP,
      wheelMultiplier: 0.95,
      smoothWheel: true,
      autoRaf: false,
      anchors: { offset: NAV_OFFSET },
    });
    lenis = instance;

    // Matikan CSS smooth-behavior selama Lenis aktif (keduanya jalan = double-smoothing).
    // lenis.css v1.3 tidak lagi membawa override ini, jadi diatur manual + dibalikin saat cleanup.
    const root = document.documentElement;
    const prevBehavior = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto";

    instance.on("scroll", () => ScrollTrigger.update());
    const tick = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const raf = requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      cancelAnimationFrame(raf);
      gsap.ticker.remove(tick);
      instance.destroy();
      root.style.scrollBehavior = prevBehavior;
      if (lenis === instance) lenis = null;
    };
  }, []);

  return null;
}
