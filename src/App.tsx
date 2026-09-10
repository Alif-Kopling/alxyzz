import { useCallback, useEffect, useState } from "react";
import { AnimatePresence } from "motion/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { AudioProvider } from "./context/AudioContext";
import { MenuBar } from "./components/MenuBar";
import { Preloader } from "./components/Preloader";
import { Hero } from "./components/Hero";
import { ClientStrip } from "./components/ClientStrip";
import { WorkStickyStack } from "./components/WorkStickyStack";
import { ProjectSkillsBridge } from "./components/ProjectSkillsBridge";
import { PortalTransition } from "./components/PortalTransition";
import { CapabilitiesPan } from "./components/CapabilitiesPan";
import { SmoothScroll, scrollToId } from "./components/SmoothScroll";
import { Quote } from "./components/Quote";
import { Story } from "./components/Story";
import { Contact } from "./components/Contact";

function scrollToContact() {
  scrollToId("contact");
}

function App() {
  const [entered, setEntered] = useState(false);
  // Sekali saja: cegah ScrollTrigger refresh saat address bar mobile
  // muncul/hilang (sumber utama pin lompat-lompat di HP).
  useEffect(() => {
    ScrollTrigger.config({ ignoreMobileResize: true });
  }, []);
  const handleEnter = useCallback(() => {
    setEntered(true);
    // pastikan mulai dari atas saat masuk halaman utama
    requestAnimationFrame(() => window.scrollTo(0, 0));
  }, []);

  return (
    <AudioProvider>
      <AnimatePresence>{entered ? null : <Preloader onEnter={handleEnter} />}</AnimatePresence>
      {entered ? (
      <div className="min-h-[100dvh] bg-[#fafafa] text-zinc-950 antialiased dark:bg-[#09090b] dark:text-zinc-50">
        <SmoothScroll />
        <div className="grain-layer" aria-hidden="true" />
        <MenuBar onContact={scrollToContact} />
        <main>
          <Hero onContact={scrollToContact} />
          <ClientStrip />
          <WorkStickyStack />
          <ProjectSkillsBridge />
          <PortalTransition />
          <CapabilitiesPan />
          <Quote />
          <Story />
          <Contact />
        </main>
      </div>
      ) : null}
    </AudioProvider>
  );
}

export default App;
