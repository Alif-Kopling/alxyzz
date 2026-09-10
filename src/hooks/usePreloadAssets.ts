import { useEffect, useState } from "react";
import { playlist } from "../lib/playlist";

const IMAGE_ASSETS = [
  "/bg.png",
  "/bg-furina.png",
  "/my-photo.png",
  "/photo-hero-1-mini.gif",
  "/furina-photo-mini-2-hero.jpg",
  "/preview-realchat.png",
  "/preview-landingpage.png",
  "/preview-archivio.png",
];

// Full mp3 ikut preload (bukan cuma metadata) — total ~30MB, jadi progress
// audio pakai byte real biar bar tetap jalan, bukan macet.
const AUDIO_ASSETS = playlist.map((t) => encodeURI(t.src));

const MODEL_URL = "/char.glb";
// Pengaman: audio 30MB di jaringan lemot bisa lama — 30 detik max, user juga
// selalu bisa skip manual (fetch yang jalan tetap lanjut ke cache).
const MAX_WAIT_MS = 30000;

export type PreloadState = {
  progress: number; // 0..100
  done: boolean;
  label: string;
};

function loadImage(src: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve(); // gagal = tetap lanjut, jangan kunci
    img.src = src;
  });
}

// fetch + baca stream biar progress byte real. Byte dibuang (tidak disimpan di
// RAM) — yang dipakai cuma HTTP cache, jadi <audio>/<img>/GLTFLoader yang minta
// URL sama nanti tinggal ambil dari cache tanpa download ulang.
async function fetchWithProgress(
  url: string,
  onBytes: (loaded: number, total: number | null) => void,
): Promise<void> {
  try {
    const res = await fetch(url, { credentials: "same-origin" });
    if (!res.ok || !res.body) {
      // fallback: baca biasa
      await res.arrayBuffer().catch(() => undefined);
      onBytes(1, 1);
      return;
    }
    const totalHeader = res.headers.get("content-length");
    const total = totalHeader ? Number(totalHeader) : null;
    const reader = res.body.getReader();
    let loaded = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      loaded += value?.length ?? 0;
      onBytes(loaded, total);
    }
  } catch {
    onBytes(1, 1);
  }
}

export function usePreloadAssets(): PreloadState {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [label, setLabel] = useState("Menyiapkan...");

  // NOTE: tanpa guard ref `started` — di StrictMode dev effect jalan 2x
  // (setup → cleanup → setup). Guard ref bikin run kedua return awal dan
  // progress macet di 0% selamanya. Tiap run punya flag `cancelled` sendiri;
  // double-fetch aman (idempotent + masuk HTTP cache).
  useEffect(() => {
    let cancelled = false;
    const safe = (fn: () => void) => {
      if (!cancelled) fn();
    };

    (async () => {
      // Bobot: model 25%, chunk three 5%, gambar 15%, audio 50%, font 5%.
      let modelFrac = 0;
      let chunkDone = 0;
      let imagesDone = 0;
      const audioFracs = AUDIO_ASSETS.map(() => 0);
      let fontsDone = 0;
      const render = () => {
        const audioFrac =
          audioFracs.length === 0
            ? 1
            : audioFracs.reduce((a, b) => a + b, 0) / audioFracs.length;
        const p =
          modelFrac * 25 +
          chunkDone * 5 +
          (imagesDone / IMAGE_ASSETS.length) * 15 +
          audioFrac * 50 +
          fontsDone * 5;
        safe(() => {
          setProgress(Math.min(99, Math.round(p)));
          if (modelFrac < 1) setLabel("Memuat model 3D...");
          else if (imagesDone < IMAGE_ASSETS.length) setLabel("Memuat gambar...");
          else if (audioFrac < 1) setLabel("Memuat audio...");
          else if (!fontsDone) setLabel("Menyiapkan font...");
        });
      };

      safe(() => setLabel("Memuat model 3D..."));

      const modelP = fetchWithProgress(MODEL_URL, (loaded, total) => {
        modelFrac = total ? Math.min(loaded / total, 1) : 0.9;
        render();
      }).then(() => {
        modelFrac = 1;
        render();
      });

      // Panas-in chunk three (CharBackdrop lazy) bareng-bareng, biar pas scroll gak jank
      const chunkP = import("../components/CharBackdrop")
        .then((m) => {
          // daftarkan glb ke cache drei juga
          return import("@react-three/drei").then((drei) => {
            try {
              (drei as unknown as { useGLTF: { preload: (u: string) => void } }).useGLTF.preload(
                MODEL_URL,
              );
            } catch {
              /* abaikan */
            }
            void m;
          });
        })
        .catch(() => undefined)
        .then(() => {
          chunkDone = 1;
          render();
        });

      // Gambar paralel
      const imagesP = Promise.all(
        IMAGE_ASSETS.map((src) =>
          loadImage(src).then(() => {
            imagesDone += 1;
            render();
          }),
        ),
      );

      // Full mp3 paralel, progress byte real per file
      const audioP = Promise.all(
        AUDIO_ASSETS.map((src, i) =>
          fetchWithProgress(src, (loaded, total) => {
            audioFracs[i] = total ? Math.min(loaded / total, 1) : 0.9;
            render();
          }).then(() => {
            audioFracs[i] = 1;
            render();
          }),
        ),
      );

      // Font bundle (@fontsource) — murah, tapi ditunggu biar tidak FOUT/geser layout
      const fontsP =
        typeof document !== "undefined" && document.fonts
          ? document.fonts.ready.then(
              () => {
                fontsDone = 1;
                render();
              },
              () => {
                fontsDone = 1;
                render();
              },
            )
          : Promise.resolve().then(() => {
              fontsDone = 1;
              render();
            });

      await Promise.all([modelP, chunkP, imagesP, audioP, fontsP]);

      safe(() => {
        setProgress(100);
        setLabel("Siap!");
        setDone(true);
      });
    })();

    const fallback = window.setTimeout(() => {
      safe(() => {
        setProgress(100);
        setLabel("Siap!");
        setDone(true);
      });
    }, MAX_WAIT_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(fallback);
    };
  }, []);

  return { progress, done, label };
}
