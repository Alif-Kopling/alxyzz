import { motion, useReducedMotion } from "motion/react";
import { WantedPoster3D } from "./canvas/WantedPoster3D";

// Hero split asimetris: kiri dakwaan, kanan poster 3D fisik. Fit initial viewport, 4 elemen teks max.
export function WantedHero() {
  const reduce = useReducedMotion();

  return (
    <section id="atas" className="relative overflow-hidden">
      <div className="mx-auto grid w-full max-w-7xl items-center gap-8 px-4 pt-20 pb-12 md:px-6 md:pt-24 lg:grid-cols-12 lg:gap-8">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="min-w-0 lg:col-span-6 xl:col-span-7"
        >
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-stamp">
            Wanted : Frontend Developer / ID
          </p>
          <h1 className="font-display mt-4 max-w-[14ch] text-4xl leading-[1.02] font-extrabold tracking-tighter text-ink uppercase md:text-6xl">
            Diburu karena terlalu sering deploy
          </h1>
          <p className="mt-4 max-w-[48ch] text-base leading-relaxed text-ink-soft">
            Alxyzz, frontend developer dari Indonesia. Bangun web cepat dengan React dan
            TypeScript. Terbuka untuk kerja dan proyek.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <a
              href="#lapor"
              className="btn-wanted btn-3d bg-stamp px-6 py-3 text-sm font-semibold text-paper"
            >
              Lapor / Rekrut
            </a>
            <a
              href="#berkas"
              className="btn-wanted btn-3d border border-ink/30 px-6 py-3 text-sm font-semibold text-ink hover:bg-ink/5"
            >
              Buka Berkas
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="relative lg:col-span-6 xl:col-span-5"
        >
          <WantedPoster3D
            photoUrl="/my-photo.webp"
            name="Alxyzz"
            code="ALX-017"
            reward="1.000.000 $"
            location="Terakhir terlihat: Subang"
          />
        </motion.div>
      </div>
    </section>
  );
}
