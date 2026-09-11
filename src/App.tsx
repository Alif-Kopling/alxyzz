import { WantedNav } from "./components/WantedNav";
import { SmoothScroll } from "./components/SmoothScroll";
import { WantedHero } from "./components/WantedHero";
import { TickerTape } from "./components/TickerTape";
import { CaseStack } from "./components/CaseStack";
import { ArsenalGrid } from "./components/ArsenalGrid";
import { TrailTimeline } from "./components/TrailTimeline";
import { Confession } from "./components/Confession";
import { ReportContact } from "./components/ReportContact";

function App() {
  return (
    <div className="min-h-[100dvh] bg-paper font-body text-ink antialiased">
      <SmoothScroll />
      <div className="grain-layer" aria-hidden="true" />
      <WantedNav />
      <main>
        <WantedHero />
        <TickerTape />
        <CaseStack />
        <ArsenalGrid />
        <TrailTimeline />
        <Confession />
        <ReportContact />
      </main>
    </div>
  );
}

export default App;
