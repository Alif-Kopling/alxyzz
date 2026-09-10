import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { playlist, type Track } from "../lib/playlist";
import { syncSfxSettings } from "../lib/sfx";

function fmt(sec: number) {
  if (!Number.isFinite(sec) || sec < 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

type Ctx = {
  playlist: Track[];
  index: number;
  track: Track;
  playing: boolean;
  volume: number;
  muted: boolean;
  time: number;
  dur: number;
  fmtTime: string;
  fmtDur: string;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  seek: (v: number) => void;
  setVolume: (v: number) => void;
  toggleMute: () => void;
  aliveCount: number;
};

const AudioCtx = createContext<Ctx | null>(null);

export function useAudio() {
  const v = useContext(AudioCtx);
  if (!v) throw new Error("useAudio must be inside AudioProvider");
  return v;
}

export function AudioProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolumeState] = useState(0.9);
  const [muted, setMuted] = useState(false);
  const [time, setTime] = useState(0);
  const [dur, setDur] = useState(0);
  const [dead, setDead] = useState<boolean[]>(() => playlist.map(() => false));
  const shouldAutoPlayRef = useRef(false);

  const aliveCount = playlist.filter((_, i) => !dead[i]).length;
  const track = playlist[index];

  // keep audio volume in sync
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    el.volume = volume;
    el.muted = muted;
  }, [volume, muted]);

  // SFX (portal, ngambek) ngikut setting mute/volume musik
  useEffect(() => {
    syncSfxSettings(muted, volume);
  }, [muted, volume]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    if (!shouldAutoPlayRef.current) {
      el.pause();
      el.load();
      setPlaying(false);
      setTime(0);
      setDur(0);
      return;
    }
    shouldAutoPlayRef.current = false;
    setTime(0);
    setDur(0);
    el.load();
    el.play()
      .then(() => setPlaying(true))
      .catch(() => setPlaying(false));
  }, [index]);

  function goNext(from = index) {
    const wasPlaying = playing;
    for (let step = 1; step <= playlist.length; step++) {
      const i = (from + step) % playlist.length;
      if (!dead[i]) {
        shouldAutoPlayRef.current = wasPlaying;
        setIndex(i);
        return;
      }
    }
  }

  function goPrev() {
    const wasPlaying = playing;
    for (let step = 1; step <= playlist.length; step++) {
      const i = (index - step + playlist.length * 2) % playlist.length;
      if (!dead[i]) {
        shouldAutoPlayRef.current = wasPlaying;
        setIndex(i);
        return;
      }
    }
  }

  function onError() {
    const wasPlaying = playing;
    setDead((prev) => {
      const next = [...prev];
      next[index] = true;
      return next;
    });
    shouldAutoPlayRef.current = wasPlaying;
    goNext();
  }

  async function toggle() {
    const el = audioRef.current;
    if (!el || aliveCount === 0) return;
    if (playing) {
      el.pause();
      setPlaying(false);
    } else {
      try {
        await el.play();
        setPlaying(true);
      } catch {
        onError();
      }
    }
  }

  function seek(v: number) {
    const el = audioRef.current;
    if (!el) return;
    el.currentTime = v;
    setTime(v);
  }

  function setVolume(v: number) {
    setVolumeState(v);
    if (v > 0 && muted) setMuted(false);
  }

  function toggleMute() {
    const el = audioRef.current;
    const next = !muted;
    setMuted(next);
    if (el) el.muted = next;
  }

  return (
    <AudioCtx.Provider
      value={{
        playlist,
        index,
        track,
        playing,
        volume,
        muted,
        time,
        dur,
        fmtTime: fmt(time),
        fmtDur: fmt(dur),
        toggle,
        next: () => goNext(),
        prev: goPrev,
        seek,
        setVolume,
        toggleMute,
        aliveCount,
      }}
    >
      <audio
        ref={audioRef}
        src={encodeURI(track.src)}
        preload="metadata"
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDur(e.currentTarget.duration)}
        onEnded={() => {
          shouldAutoPlayRef.current = true;
          goNext();
        }}
        onError={onError}
      />
      {children}
    </AudioCtx.Provider>
  );
}
