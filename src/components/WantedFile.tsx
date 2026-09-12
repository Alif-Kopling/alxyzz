import { useState, useRef } from "react";
import { FolderSimple } from "@phosphor-icons/react";
import { wantedFile } from "../data/wanted";
import { Reveal } from "./Reveal";
import { useReducedMotion } from "motion/react";

const strip: Array<{ label: string; value: string; hot?: boolean }> = [
  { label: "Case ID", value: wantedFile.caseId },
  { label: "Status", value: wantedFile.status },
  { label: "Threat Level", value: wantedFile.threat, hot: true },
  { label: "Classification", value: wantedFile.classification },
];

// Berkas identitas target: kartu dossier 3D fisik tepat di bawah hero.
export function WantedFile() {
  const containerRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (reduce || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setTilt({
      x: (y - 0.5) * -4,
      y: (x - 0.5) * 4,
    });
  }

  function onMouseLeave() {
    setTilt({ x: 0, y: 0 });
  }

  return (
    <section
      id="biodata"
      aria-label="Berkas identitas"
      className="mx-auto max-w-7xl scroll-mt-24 px-4 py-16 md:px-6 md:py-24"
      style={{ perspective: "1400px" }}
    >
      <Reveal>
        <div
          ref={containerRef}
          onMouseMove={onMouseMove}
          onMouseLeave={onMouseLeave}
          className="paper-raised card-dossier relative bg-paper-card p-6 pt-10 md:p-10 md:pt-12 transition-transform duration-200 ease-out"
          style={{
            transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
            transformStyle: "preserve-3d",
          }}
        >
          {/* 3D Physical Tab */}
          <div
            aria-hidden="true"
            className="absolute -top-3 left-6 md:left-10 flex items-center gap-2 border-t-2 border-x-2 border-ink/25 bg-paper px-4 py-1 font-mono text-[10px] font-bold tracking-[0.2em] text-ink-soft uppercase shadow-[2px_-2px_0_rgba(22,19,14,0.15)]"
            style={{ transform: "translateZ(10px)" }}
          >
            <FolderSimple size={12} weight="bold" className="text-stamp" />
            FILE // RECORD: ALX-017
          </div>

          <span
            aria-hidden="true"
            className="absolute top-6 right-6 -rotate-6 border-[3px] border-stamp px-3 py-1 font-mono text-xs font-bold tracking-[0.2em] text-stamp uppercase outline-1 outline-stamp outline-offset-2 shadow-sm md:top-8 md:right-8"
            style={{ transform: "translateZ(12px) rotate(-6deg)" }}
          >
            At Large
          </span>
          <h2 className="font-display max-w-[16ch] text-3xl font-extrabold tracking-tighter text-ink uppercase md:text-4xl">
            Wanted File
          </h2>

          <dl className="mt-8 grid grid-cols-2 gap-px border border-ink/25 bg-ink/25 lg:grid-cols-4">
            {strip.map((c) => (
              <div key={c.label} className="bg-paper-card p-4 md:p-5">
                <dt className="font-mono text-[10px] font-bold tracking-[0.22em] text-ink-soft uppercase">
                  {c.label}
                </dt>
                <dd
                  className={`font-display mt-1.5 text-lg font-extrabold tracking-tight uppercase ${
                    c.hot ? "text-stamp" : "text-ink"
                  }`}
                >
                  {c.value}
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-10 grid gap-10 lg:grid-cols-2">
            <div>
              <h3 className="font-display text-xl font-extrabold tracking-tight text-ink uppercase md:text-2xl">
                Identitas Target
              </h3>
              <dl className="mt-4 border-y border-ink/20">
                {wantedFile.identity.map((row) => (
                  <div
                    key={row.label}
                    className="grid grid-cols-[120px_1fr] gap-3 border-b border-ink/10 py-3 last:border-b-0 sm:grid-cols-[160px_1fr]"
                  >
                    <dt className="font-mono text-xs font-bold tracking-[0.18em] text-ink-soft uppercase">
                      {row.label}
                    </dt>
                    <dd className="text-sm font-semibold text-ink md:text-base">{row.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div>
              <h3 className="font-display text-xl font-extrabold tracking-tight text-ink uppercase md:text-2xl">
                Profil
              </h3>
              <div className="mt-4 grid gap-4">
                {wantedFile.profile.map((p, i) => (
                  <p key={i} className="max-w-[65ch] text-base leading-relaxed text-ink-soft">
                    {p}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
