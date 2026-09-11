const items = [
  "Terakhir terlihat: Subang",
  "Senjata: React / TypeScript / Tailwind",
  "Status: Open for hire",
  "Reward: 10.000.000 Coin",
];

// Satu-satunya marquee di page: pita kabar tinta.
export function TickerTape() {
  return (
    <section aria-label="Kabar buron" className="overflow-hidden border-y border-ink bg-ink py-3">
      <div className="ticker-track flex w-max items-center gap-8 whitespace-nowrap">
        {[0, 1].map((half) => (
          <div key={half} aria-hidden={half === 1} className="flex items-center gap-8">
            {[0, 1, 2, 3].map((rep) => (
              <div key={rep} className="flex items-center gap-8">
                {items.map((item) => (
                  <span
                    key={`${rep}-${item}`}
                    className="font-mono text-xs font-semibold tracking-[0.2em] text-paper uppercase"
                  >
                    {item}
                    <span aria-hidden="true" className="ml-8 text-stamp">
                      ★
                    </span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
