import { useEffect, useState } from "react";
import { AnimatePresence } from "motion/react";
import { WantedNav } from "./components/WantedNav";
import { SmoothScroll } from "./components/SmoothScroll";
import { WantedLoader } from "./components/WantedLoader";
import { WantedHero } from "./components/WantedHero";
import { TickerTape } from "./components/TickerTape";
import { CaseStack } from "./components/CaseStack";
import { ArsenalGrid } from "./components/ArsenalGrid";
import { TrailTimeline } from "./components/TrailTimeline";
import { Confession } from "./components/Confession";
import { ReportContact } from "./components/ReportContact";

function App() {
  // Fixed intro 3.4s tiap refresh. ?noloader untuk bypass saat development.
  const [loading, setLoading] = useState(
    () =>
      typeof window === "undefined" ||
      !new URLSearchParams(window.location.search).has("noloader"),
  );

  useEffect(() => {
    if (!loading) return;
    window.scrollTo(0, 0);
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [loading]);

  return (
    <div className="min-h-[100dvh] bg-paper font-body text-ink antialiased">
      <SmoothScroll />
      <div className="grain-layer" aria-hidden="true" />
      <AnimatePresence>
        {loading && <WantedLoader key="wanted-loader" onDone={() => setLoading(false)} />}
      </AnimatePresence>
      <WantedNav />
      {!loading && (
        <main>
          <WantedHero />
          <TickerTape />
          <CaseStack />
          <ArsenalGrid />
          <TrailTimeline />
          <Confession />
          <ReportContact />
        </main>
      )}
    </div>
  );
}

export default App;
