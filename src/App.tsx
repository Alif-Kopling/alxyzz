import { AudioProvider } from "./context/AudioContext";
import { MenuBar } from "./components/MenuBar";
import { Hero } from "./components/Hero";
import { ClientStrip } from "./components/ClientStrip";
import { WorkStickyStack } from "./components/WorkStickyStack";
import { CapabilitiesPan } from "./components/CapabilitiesPan";
import { Quote } from "./components/Quote";
import { Process } from "./components/Process";
import { Contact } from "./components/Contact";

function scrollToContact() {
  document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
}

function App() {
  return (
    <AudioProvider>
      <div className="min-h-[100dvh] bg-[#fafafa] text-zinc-950 antialiased dark:bg-[#09090b] dark:text-zinc-50">
        <div className="grain-layer" aria-hidden="true" />
        <MenuBar onContact={scrollToContact} />
        <main>
          <Hero onContact={scrollToContact} />
          <ClientStrip />
          <WorkStickyStack />
          <div className="pt-20 md:pt-28">
            <CapabilitiesPan />
          </div>
          <Quote />
          <Process />
          <Contact />
        </main>
      </div>
    </AudioProvider>
  );
}

export default App;
