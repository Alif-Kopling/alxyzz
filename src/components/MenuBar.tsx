import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  BatteryCharging,
  Check,
  Circle,
  List,
  MagnifyingGlass,
  Monitor,
  MusicNote,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  SpeakerHigh,
  SpeakerSlash,
  Sun,
  WifiHigh,
  X,
} from "@phosphor-icons/react";
import { Z } from "../lib/zIndex";
import { useNow } from "../hooks/useNow";
import { ThemeButton } from "./ThemeButton";
import { useAudio } from "../context/AudioContext";
import { scrollToId } from "./SmoothScroll";

const links = [
  { label: "Projects", href: "#projects" },
  { label: "Skills", href: "#skills" },
  { label: "Story", href: "#story" },
  { label: "Contact", href: "#contact" },
];

function scrollTo(id: string) {
  scrollToId(id);
}

function useCloseOnOutside(ref: React.RefObject<HTMLDivElement | null>, onClose: () => void) {
  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [ref, onClose]);
}

function WifiPopover({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useCloseOnOutside(ref, onClose);
  const [enabled, setEnabled] = useState(true);
  return (
    <div
      ref={ref}
      role="dialog"
      aria-label="Wi-Fi"
      className="popover-safe fixed top-8 right-2 z-[70] w-[calc(100vw-16px)] max-w-72 liquid-panel p-4 sm:right-24 sm:w-72"
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold tracking-wide text-zinc-400">Wi-Fi</p>
        <button
          type="button"
          onClick={() => setEnabled((v) => !v)}
          aria-label={enabled ? "Matikan Wi-Fi" : "Nyalakan Wi-Fi"}
          className={`relative h-6 w-11 rounded-full transition-colors ${enabled ? "bg-[#0a84ff]" : "bg-white/15"}`}
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${enabled ? "left-5" : "left-0.5"}`}
          />
        </button>
      </div>
      <div className="mt-3 grid gap-1">
        {["Alxyzz_5G", "Office_Fiber", "Guest_WiFi"].map((name, i) => (
          <div
            key={name}
            className={`flex items-center justify-between rounded-xl px-3 py-2 text-sm ${i === 0 && enabled ? "bg-white/10 text-white" : "text-zinc-300"}`}
          >
            <span className="flex items-center gap-2">
              <WifiHigh size={14} weight={i === 0 ? "fill" : "regular"} />
              {name}
            </span>
            {i === 0 && enabled && <Check size={14} weight="bold" className="text-[#0a84ff]" />}
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => {
          onClose();
          scrollTo("projects");
        }}
        className="mt-3 w-full rounded-full bg-white/10 py-2 text-xs font-semibold text-white hover:bg-white/15"
      >
        Buka Projects
      </button>
      <p className="mt-2 text-center text-[11px] text-zinc-500">Known networks • Auto-Join aktif</p>
    </div>
  );
}

function DisplayPopover({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useCloseOnOutside(ref, onClose);
  const [brightness, setBrightness] = useState(92);
  useEffect(() => {
    document.documentElement.style.filter = `brightness(${brightness}%)`;
    return () => {
      document.documentElement.style.filter = "";
    };
  }, [brightness]);
  return (
    <div
      ref={ref}
      role="dialog"
      aria-label="Display"
      className="popover-safe fixed top-8 right-2 z-[70] w-[calc(100vw-16px)] max-w-72 liquid-panel p-4 sm:right-16 sm:w-72"
    >
      <p className="text-xs font-semibold tracking-wide text-zinc-400">Display</p>
      <div className="mt-3 flex items-center gap-3">
        <Sun size={16} weight="fill" className="text-zinc-300" />
        <input
          type="range"
          min={60}
          max={120}
          value={brightness}
          onChange={(e) => setBrightness(Number(e.target.value))}
          aria-label="Brightness"
          className="h-1 w-full accent-white"
        />
        <span className="font-mono text-xs tabular-nums text-zinc-300">{brightness}%</span>
      </div>
      <div className="mt-3 flex items-center justify-between rounded-xl bg-white/5 px-3 py-2">
        <span className="text-xs text-zinc-300">Night Shift</span>
        <span className="text-[11px] text-zinc-500">Off</span>
      </div>
      <button
        type="button"
        onClick={() => {
          onClose();
          scrollTo("skills");
        }}
        className="mt-3 w-full rounded-full bg-white/10 py-2 text-xs font-semibold text-white hover:bg-white/15"
      >
        Lihat Skills
      </button>
    </div>
  );
}

function BatteryPopover({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useCloseOnOutside(ref, onClose);
  const [level, setLevel] = useState<number | null>(null);
  const [charging, setCharging] = useState(false);
  useEffect(() => {
    // @ts-expect-error Battery API tidak ada di semua browser
    if (navigator.getBattery) {
      // @ts-expect-error
      navigator.getBattery().then((b: { level: number; charging: boolean }) => {
        setLevel(Math.round(b.level * 100));
        setCharging(b.charging);
      });
    } else {
      setLevel(87);
      setCharging(true);
    }
  }, []);
  return (
    <div
      ref={ref}
      role="dialog"
      aria-label="Battery"
      className="popover-safe fixed top-8 right-2 z-[70] w-[calc(100vw-16px)] max-w-72 liquid-panel p-4 sm:right-10 sm:w-72"
    >
      <p className="text-xs font-semibold tracking-wide text-zinc-400">Battery</p>
      <div className="mt-3 flex items-center gap-3">
        <span className="rounded-lg bg-white/10 p-2 text-white">
          <BatteryCharging size={18} weight={charging ? "fill" : "regular"} />
        </span>
        <div>
          <p className="text-sm font-semibold text-white">{level ?? 87}% {charging ? "• Charging" : ""}</p>
          <p className="text-xs text-zinc-400">{charging ? "Power Adapter • Fast charging" : "On battery • ~6 hr remaining"}</p>
        </div>
      </div>
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-white" style={{ width: `${level ?? 87}%` }} />
      </div>
      <button
        type="button"
        onClick={() => {
          onClose();
          scrollTo("story");
        }}
        className="mt-3 w-full rounded-full bg-white/10 py-2 text-xs font-semibold text-white hover:bg-white/15"
      >
        Buka Story
      </button>
    </div>
  );
}

// Popover macOS: kartu gelap blur dengan slider dan kontrol lagu.
// Diposisikan absolute di bawah navbar, klik luar menutup.
function VolumePopover({ onClose }: { onClose: () => void }) {
  const { volume, muted, setVolume, toggleMute } = useAudio();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div
      ref={ref}
      role="dialog"
      aria-label="Kontrol volume"
      className="popover-safe fixed top-8 right-2 z-[70] w-[calc(100vw-16px)] max-w-72 liquid-panel p-4 sm:w-72"
    >
      <p className="text-xs font-semibold tracking-wide text-zinc-400">Sound</p>
      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          onClick={toggleMute}
          aria-label={muted ? "Unmute" : "Mute"}
          className="rounded-full bg-white/10 p-2 text-white hover:bg-white/15"
        >
          {muted || volume === 0 ? <SpeakerSlash size={16} weight="fill" /> : <SpeakerHigh size={16} weight="fill" />}
        </button>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={muted ? 0 : volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          aria-label="Atur volume"
          className="h-1 w-full accent-white"
        />
        <span className="font-mono text-xs tabular-nums text-zinc-300">{Math.round((muted ? 0 : volume) * 100)}%</span>
      </div>
      <p className="mt-2 text-[11px] text-zinc-500">Output: Built-in Speakers</p>
    </div>
  );
}

function MusicPopover({ onClose }: { onClose: () => void }) {
  const { track, index, playlist, playing, time, dur, fmtTime, fmtDur, toggle, next, prev, seek, volume, setVolume } =
    useAudio();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div
      ref={ref}
      role="dialog"
      aria-label="Pemutar musik"
      className="popover-safe fixed top-8 right-2 z-[70] w-[calc(100vw-16px)] max-w-80 liquid-panel p-4 sm:w-80"
    >
      <div className="flex items-center gap-3">
        <span className="rounded-xl bg-white p-2.5 text-zinc-900">
          <MusicNote size={18} weight="fill" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-white">{track.title}</p>
          <p className="truncate text-xs text-zinc-400">
            {track.artist} - {index + 1} dari {playlist.length}
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <span className="font-mono text-[11px] tabular-nums text-zinc-400">{fmtTime}</span>
        <input
          type="range"
          min={0}
          max={Math.max(dur, 0)}
          step={0.1}
          value={Math.min(time, dur || 0)}
          onChange={(e) => seek(Number(e.target.value))}
          aria-label="Geser posisi lagu"
          className="h-1 w-full accent-white"
        />
        <span className="font-mono text-[11px] tabular-nums text-zinc-400">{fmtDur}</span>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={prev}
            aria-label="Lagu sebelumnya"
            className="rounded-full bg-white/10 p-2 text-white hover:bg-white/15"
          >
            <SkipBack size={16} weight="fill" />
          </button>
          <button
            type="button"
            onClick={toggle}
            aria-label={playing ? "Jeda" : "Putar"}
            className="rounded-full bg-white p-2.5 text-zinc-900 hover:bg-zinc-100"
          >
            {playing ? <Pause size={16} weight="fill" /> : <Play size={16} weight="fill" />}
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Lagu berikutnya"
            className="rounded-full bg-white/10 p-2 text-white hover:bg-white/15"
          >
            <SkipForward size={16} weight="fill" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <SpeakerHigh size={14} className="text-zinc-400" weight="regular" />
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            aria-label="Volume pemutar"
            className="h-1 w-20 accent-white"
          />
        </div>
      </div>
    </div>
  );
}

// System bar gelap tipis h-7, satu baris di desktop.
// Kiri: Alxyzz + nav. Kanan: pill Hubungi Saya + wifi/monitor/battery/speaker/music + jam.
// Semua tombol punya aksi nyata, speaker membuka volume popover, music membuka music popover.
export function MenuBar({ onContact }: { onContact: () => void }) {
  const [open, setOpen] = useState(false);
  const [popover, setPopover] = useState<"wifi" | "display" | "battery" | "volume" | "music" | null>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  const closePopover = () => setPopover(null);
  const now = useNow();
  const time = now
    .toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false })
    .replace(/\./g, ":");

  return (
    <header
      // Fixed overlay (bukan sticky): gambar hero jalan ke belakang navbar,
      // jadi kaca navbar mantulin bg yang terang kayak window hero.
      className="liquid-nav fixed inset-x-0 top-0 hidden text-zinc-800 md:block dark:text-zinc-200"
      style={{ zIndex: Z.menubar } as React.CSSProperties}
    >
      <nav className="mx-auto flex h-7 max-w-[1600px] items-center justify-between gap-2 px-2 text-[12px] leading-none">
        {/* kiri */}
        <div className="flex min-w-0 items-center gap-3">
          <a href="#atas" className="flex shrink-0 items-center gap-2" aria-label="Ke atas">
            <Circle size={16} weight="regular" className="text-zinc-700 dark:text-white/90" />
            <span className="font-semibold tracking-tight text-zinc-900 dark:text-white">Alxyzz</span>
          </a>

          <ul className="hidden items-center gap-4 lg:flex">
            {links.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>

          <button
            type="button"
            className="rounded p-1 text-zinc-700 hover:bg-black/5 dark:text-zinc-200 dark:hover:bg-white/10 lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "Tutup menu" : "Buka menu"}
          >
            {open ? <X size={14} weight="bold" /> : <List size={14} weight="bold" />}
          </button>
        </div>

        {/* kanan: urutan contact me wifi xx xx xx xx */}
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={onContact}
            className="hidden rounded-full bg-[#2440ff] px-3 py-1 text-[11px] font-semibold text-white hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white dark:bg-[#8ea2ff] dark:text-black sm:inline-flex"
          >
            Hubungi Saya
          </button>

          <div className="hidden items-center gap-1 sm:flex">
            <button
              type="button"
              onClick={() => setPopover((v) => (v === "wifi" ? null : "wifi"))}
              aria-label="Wi-Fi"
              aria-expanded={popover === "wifi"}
              title="Wi-Fi"
              className={`rounded p-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${popover === "wifi" ? "bg-black/10 text-zinc-900 dark:bg-white/15 dark:text-white" : "text-zinc-600 hover:bg-black/5 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-white/10 dark:hover:text-white"}`}
            >
              <WifiHigh size={14} weight="regular" />
            </button>
            <button
              type="button"
              onClick={() => setPopover((v) => (v === "display" ? null : "display"))}
              aria-label="Display"
              aria-expanded={popover === "display"}
              title="Display"
              className={`rounded p-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${popover === "display" ? "bg-black/10 text-zinc-900 dark:bg-white/15 dark:text-white" : "text-zinc-600 hover:bg-black/5 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-white/10 dark:hover:text-white"}`}
            >
              <Monitor size={14} weight="regular" />
            </button>
            <button
              type="button"
              onClick={() => setPopover((v) => (v === "battery" ? null : "battery"))}
              aria-label="Battery"
              aria-expanded={popover === "battery"}
              title="Battery"
              className={`rounded p-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${popover === "battery" ? "bg-black/10 text-zinc-900 dark:bg-white/15 dark:text-white" : "text-zinc-600 hover:bg-black/5 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-white/10 dark:hover:text-white"}`}
            >
              <BatteryCharging size={16} weight="regular" />
            </button>
            <button
              type="button"
              onClick={() => setPopover((v) => (v === "volume" ? null : "volume"))}
              aria-label="Buka kontrol volume"
              aria-expanded={popover === "volume"}
              title="Volume"
              className={`rounded p-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${popover === "volume" ? "bg-black/10 text-zinc-900 dark:bg-white/15 dark:text-white" : "text-zinc-600 hover:bg-black/5 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-white/10 dark:hover:text-white"}`}
            >
              <SpeakerHigh size={14} weight="regular" />
            </button>
            <button
              type="button"
              onClick={() => setPopover((v) => (v === "music" ? null : "music"))}
              aria-label="Buka pemutar musik"
              aria-expanded={popover === "music"}
              title="Music"
              className={`rounded p-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${popover === "music" ? "bg-black/10 text-zinc-900 dark:bg-white/15 dark:text-white" : "text-zinc-600 hover:bg-black/5 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-white/10 dark:hover:text-white"}`}
            >
              <MusicNote size={14} weight="fill" />
            </button>
            <button
              type="button"
              onClick={() => scrollTo("atas")}
              aria-label="Ke atas"
              title="Ke atas"
              className="rounded p-1 text-zinc-600 hover:bg-black/5 hover:text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white dark:text-zinc-300 dark:hover:bg-white/10 dark:hover:text-white"
            >
              <MagnifyingGlass size={14} weight="regular" />
            </button>
            <span
              className="rounded border border-zinc-900/15 px-1 py-0.5 text-[10px] leading-none text-zinc-600 dark:border-white/25 dark:text-zinc-300"
              aria-label="Keyboard US"
              title="US"
            >
              US
            </span>
          </div>

          <ThemeButton className="inline-flex p-1.5 text-zinc-600 hover:bg-black/5 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-white/10 dark:hover:text-white sm:p-1" />
          <span className="font-mono text-[12px] tabular-nums text-zinc-900 dark:text-white">{time}</span>
        </div>
      </nav>
      {/* Portal ke body: lepas dari header yang punya backdrop-filter (containing
          block jebakan buat fixed). Dijamin ngambang di atas bg + konten, z-70 di
          atas grain (60), di bawah preloader (100). */}
      {mounted && popover === "wifi" && createPortal(<WifiPopover onClose={closePopover} />, document.body)}
      {mounted && popover === "display" && createPortal(<DisplayPopover onClose={closePopover} />, document.body)}
      {mounted && popover === "battery" && createPortal(<BatteryPopover onClose={closePopover} />, document.body)}
      {mounted && popover === "volume" && createPortal(<VolumePopover onClose={closePopover} />, document.body)}
      {mounted && popover === "music" && createPortal(<MusicPopover onClose={closePopover} />, document.body)}

      {open && (
        <div
          className="border-t border-zinc-200 bg-white px-2 py-3 lg:hidden dark:border-white/10 dark:bg-black"
          style={{ zIndex: Z.menu }}
        >
          <ul className="grid gap-1">
            {links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block rounded px-2 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-200 dark:hover:bg-white/10 dark:hover:text-white"
                >
                  {l.label}
                </a>
              </li>
            ))}
            <li className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onContact();
                }}
                className="w-full rounded-full bg-[#2440ff] px-4 py-3 text-sm font-semibold text-white dark:bg-[#8ea2ff] dark:text-black"
              >
                Hubungi Saya
              </button>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
