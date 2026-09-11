import { motion, useReducedMotion } from "motion/react";
import { profile } from "../data/wanted";

// Hero split asimetris: kiri dakwaan, kanan poster. Fit 100dvh, 4 elemen teks max.
export function WantedHero() {
  const reduce = useReducedMotion();

  return (
    <section id="atas" className="relative overflow-hidden">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 pt-[104px] pb-14 md:px-6 md:pt-[132px] lg:grid-cols-12 lg:gap-6">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="min-w-0 lg:col-span-7"
        >
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-stamp">
            Wanted — Frontend Developer / ID
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
          <p className="mt-6 font-mono text-xs tracking-[0.14em] text-ink-soft uppercase">
            {profile.publicRepos} repos · Indonesia · {profile.company}
          </p>
        </motion.div>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="relative lg:col-span-5"
        >
          <figure className="paper-raised card-dossier relative ml-auto max-w-sm rotate-2 bg-paper-card p-3 pb-4">
            <img
              src="/my-photo.png"
              alt="Foto buronan Alxyzz"
              loading="eager"
              fetchPriority="high"
              className="aspect-[4/5] w-full object-cover object-top"
            />
            <div className="mt-3 flex items-baseline justify-between gap-2 border-t border-ink/15 pt-2">
              <figcaption className="font-display text-lg font-extrabold tracking-tight text-ink uppercase">
                Alxyzz
              </figcaption>
              <span className="font-mono text-[11px] tracking-[0.18em] text-ink-soft">
                ALX-017
              </span>
            </div>
            <motion.span
              aria-hidden="true"
              initial={reduce ? false : { opacity: 0, scale: 1.5, rotate: -14 }}
              animate={{ opacity: 1, scale: 1, rotate: -8 }}
              transition={{ delay: 0.6, type: "spring", stiffness: 220, damping: 17 }}
              className="absolute top-5 -left-3 border-[3px] border-stamp px-3 py-1 font-mono text-sm font-bold tracking-[0.2em] text-stamp uppercase outline-1 outline-stamp outline-offset-2"
            >
              Reward: 3 Netherite Ingots
            </motion.span>
          </figure>
          <p className="mt-4 text-right font-mono text-[11px] tracking-[0.18em] text-ink-soft uppercase">
            Terakhir terlihat: Subang
          </p>
        </motion.div>
      </div>
    </section>
  );
}
