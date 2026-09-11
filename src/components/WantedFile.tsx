import { wantedFile } from "../data/wanted";
import { Reveal } from "./Reveal";

const strip: Array<{ label: string; value: string; hot?: boolean }> = [
  { label: "Case ID", value: wantedFile.caseId },
  { label: "Status", value: wantedFile.status },
  { label: "Threat Level", value: wantedFile.threat, hot: true },
  { label: "Classification", value: wantedFile.classification },
];

// Berkas identitas target: kartu dossier full-width tepat di bawah hero.
export function WantedFile() {
  return (
    <section
      id="biodata"
      aria-label="Berkas identitas"
      className="mx-auto max-w-7xl scroll-mt-24 px-4 py-16 md:px-6 md:py-24"
    >
      <Reveal>
        <div className="paper-raised card-dossier relative bg-paper-card p-6 md:p-10">
          <span
            aria-hidden="true"
            className="absolute top-5 right-5 -rotate-6 border-[3px] border-stamp px-3 py-1 font-mono text-xs font-bold tracking-[0.2em] text-stamp uppercase outline-1 outline-stamp outline-offset-2 md:top-8 md:right-8"
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
