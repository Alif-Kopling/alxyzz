import { useEffect, useState } from "react";
import { AnimatePresence } from "motion/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { WantedNav } from "./components/WantedNav";
import { SmoothScroll } from "./components/SmoothScroll";
import { WantedLoader } from "./components/WantedLoader";
import { WantedHero } from "./components/WantedHero";
import { SectionTape } from "./components/SectionTape";
import { WantedFile } from "./components/WantedFile";
import { TickerTape } from "./components/TickerTape";
import { CaseStack } from "./components/CaseStack";
import { ArsenalGrid } from "./components/ArsenalGrid";
import { TrailTimeline } from "./components/TrailTimeline";
import { Confession } from "./components/Confession";
import { ReportContact } from "./components/ReportContact";

gsap.registerPlugin(ScrollTrigger);

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

  // Geometri pin diukur ulang begitu font/gambar/loader selesai —
  // tanpa ini pin basi dan scroll patah-patah pas balik arah.
  useEffect(() => {
    function refresh() {
      ScrollTrigger.refresh();
    }
    if (document.fonts) {
      document.fonts.ready.then(refresh).catch(function () {});
    }
    window.addEventListener("load", refresh);
    return function () {
      window.removeEventListener("load", refresh);
    };
  }, []);

  useEffect(() => {
    if (loading) return;
    const t1 = window.setTimeout(function () {
      ScrollTrigger.refresh();
    }, 400);
    const t2 = window.setTimeout(function () {
      ScrollTrigger.refresh();
    }, 1500);
    return function () {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
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
          <SectionTape />
          <WantedFile />
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
