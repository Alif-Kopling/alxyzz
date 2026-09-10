import { MusicNote, Pause, Play, SkipBack, SkipForward } from "@phosphor-icons/react";
import { useAudio } from "../context/AudioContext";

// Kartu player di dalam hero, sekarang cuma UI yang baca dari AudioContext.
// Elemen <audio> hidup di provider, jadi kontrol dari navbar juga sinkron.
export function PlayerCard() {
  const { track, index, playlist, playing, time, dur, fmtTime, fmtDur, toggle, next, prev, seek, aliveCount } =
    useAudio();

  if (aliveCount === 0) {
    return (
      <div
        aria-label="Audio menyusul"
        className="mt-3 flex items-center gap-3 rounded-2xl border border-dashed border-zinc-700/40 bg-white/30 px-4 py-3 backdrop-blur-xl dark:border-white/25 dark:bg-zinc-900/50"
      >
        <span className="rounded-full bg-zinc-950 p-2 text-white dark:bg-zinc-100 dark:text-zinc-950">
          <MusicNote size={18} weight="bold" />
        </span>
        <span>
          <span className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100">Audio menyusul</span>
          <span className="block text-xs text-zinc-600 dark:text-zinc-400">Taruh 1-3 mp3 di public/audio</span>
        </span>
      </div>
    );
  }

  return (
    <div className="mt-2 rounded-2xl border border-white/25 bg-white/50 px-3 py-2.5 backdrop-blur-xl sm:px-4 sm:py-3 dark:border-white/10 dark:bg-zinc-900/60 md:mt-3">
      <div className="flex items-center gap-3">
        <span className="rounded-full bg-zinc-950 p-2 text-white dark:bg-zinc-100 dark:text-zinc-950">
          <MusicNote size={18} weight="bold" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">{track.title}</p>
          <p className="truncate text-xs text-zinc-600 dark:text-zinc-400">
            {track.artist} - {index + 1} dari {playlist.length}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={prev}
            aria-label="Lagu sebelumnya"
            className="rounded-full p-1.5 text-zinc-700 transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-[#2440ff] active:scale-95 dark:text-zinc-300"
          >
            <SkipBack size={18} weight="fill" />
          </button>
          <button
            type="button"
            onClick={toggle}
            aria-label={playing ? "Jeda" : "Putar"}
            className="rounded-full bg-zinc-950 p-2 text-white transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2440ff] active:scale-95 dark:bg-zinc-100 dark:text-zinc-950"
          >
            {playing ? <Pause size={18} weight="fill" /> : <Play size={18} weight="fill" />}
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Lagu berikutnya"
            className="rounded-full p-1.5 text-zinc-700 transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-[#2440ff] active:scale-95 dark:text-zinc-300"
          >
            <SkipForward size={18} weight="fill" />
          </button>
        </div>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <span className="font-mono text-[11px] tabular-nums text-zinc-600 dark:text-zinc-400">{fmtTime}</span>
        <input
          type="range"
          min={0}
          max={Math.max(dur, 0)}
          step={0.1}
          value={Math.min(time, dur || 0)}
          onChange={(e) => seek(Number(e.target.value))}
          aria-label="Geser posisi lagu"
          className="h-1 w-full accent-[#2440ff] dark:accent-[#8ea2ff]"
        />
        <span className="font-mono text-[11px] tabular-nums text-zinc-600 dark:text-zinc-400">{fmtDur}</span>
      </div>
    </div>
  );
}
