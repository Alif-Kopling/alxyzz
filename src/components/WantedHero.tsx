import { lazy, Suspense } from "react";
import { motion, useReducedMotion } from "motion/react";

const WantedPoster3D = lazy(() =>
  import("./canvas/WantedPoster3D").then((m) => ({ default: m.WantedPoster3D }))
);

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
          initial={reduce ? false : { opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="relative lg:col-span-6 xl:col-span-5"
        >
          <Suspense
            fallback={
              <figure className="paper-raised card-dossier relative ml-auto max-w-sm rotate-2 bg-paper-card p-4 pb-5">
                <div className="border-4 border-ink p-3 text-center">
                  <p className="font-display text-3xl font-extrabold tracking-[0.22em] text-ink uppercase">
                    WANTED
                  </p>
                  <div className="my-1.5 bg-ink py-1 font-mono text-[10px] font-bold tracking-[0.24em] text-paper uppercase">
                    DEAD OR ALIVE
                  </div>
                  <div className="border-2 border-ink p-1">
                    <img
                      src="/my-photo.webp"
                      alt="Foto buronan Alxyzz"
                      className="aspect-[4/5] w-full object-cover object-top"
                    />
                  </div>
                  <div className="my-1.5 bg-ink py-1 font-mono text-[10px] font-bold tracking-[0.16em] text-paper uppercase">
                    ARMED AND VERY DANGEROUS
                  </div>
                  <div className="mt-2 flex items-baseline justify-between px-1">
                    <div className="text-left font-mono">
                      <span className="block text-xs font-black tracking-wider text-ink">CASH</span>
                      <span className="block text-[9px] font-bold tracking-widest text-ink">REWARD</span>
                    </div>
                    <span className="font-display text-2xl font-black tracking-tight text-ink">
                      1.000.000 $
                    </span>
                  </div>
                </div>
              </figure>
            }
          >
            <WantedPoster3D
              photoUrl="/my-photo.webp"
              name="Alxyzz"
              code="ALX-017"
              reward="1.000.000 $"
              location="Terakhir terlihat: Subang"
            />
          </Suspense>
        </motion.div>
      </div>
    </section>
  );
}
