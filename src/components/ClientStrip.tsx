import {
  siGsap,
  siReact,
  siTailwindcss,
  siTypescript,
  siVite,
} from "simple-icons";
import { Reveal } from "./Reveal";
import { profile } from "../lib/github";

// Strip stack di bawah hero, logo SVG asli saja, tanpa label kategori terlihat.
// Sumber: Simple Icons npm, render inline dengan currentColor agar adaptif terang dan gelap.
const stack = [
  { icon: siReact, label: "React" },
  { icon: siTypescript, label: "TypeScript" },
  { icon: siTailwindcss, label: "Tailwind CSS" },
  { icon: siVite, label: "Vite" },
  { icon: siGsap, label: "GSAP" },
];

export function ClientStrip() {
  return (
    <section aria-label="Stack utama" className="mx-auto max-w-7xl px-4 pt-14 md:px-6">
      <Reveal>
        <ul className="grid grid-cols-3 items-center gap-6 border-y border-zinc-200 py-6 sm:grid-cols-5 dark:border-zinc-800">
          {stack.map((c) => (
            <li key={c.label} className="flex justify-center">
              <svg
                viewBox="0 0 24 24"
                role="img"
                aria-label={c.label}
                className="h-7 w-7 text-zinc-800 dark:text-zinc-200"
                fill="currentColor"
              >
                <title>{c.label}</title>
                <path d={c.icon.path} />
              </svg>
            </li>
          ))}
        </ul>
        <p className="pt-4 text-center font-mono text-xs text-zinc-500 dark:text-zinc-400">
          {profile.username} di GitHub. Fokus pada React dan TypeScript.
        </p>
      </Reveal>
    </section>
  );
}
