import { useEffect, useReducer, useState } from "react";
import {
  defaultPose,
  livePose,
  resetPose,
  savePose,
  touchPose,
  type Axis3,
  type HandState,
} from "./charPose";

// Panel kontrol full-body Furina.
// PosePanel (badan + ukuran + kursi) di kiri bawah,
// FacePanel (wajah) dipisah di kanan bawah.
// Semua angka kelihatan biar gampang di-SS ke developer.
// Muncul di localhost atau kalau URL ada ?pose=1

function Row(props: {
  label: string;
  value: number;
  def: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
}) {
  const { label, value, def, min, max, step = 0.01, onChange } = props;
  const changed = Math.abs(value - def) > 1e-9;
  return (
    <label className="block leading-tight">
      <span className="flex justify-between gap-2">
        <span className="text-zinc-300">{label}</span>
        <b className={changed ? "text-amber-300" : "text-zinc-100"}>{value.toFixed(2)}</b>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="block w-full"
      />
    </label>
  );
}

function Axes(props: {
  title: string;
  value: Axis3;
  def: Axis3;
  min?: number;
  max?: number;
  onChange: (v: Axis3) => void;
}) {
  const { title, value, def, min = -1.5, max = 1.5, onChange } = props;
  return (
    <details className="rounded border border-white/10 px-1.5 py-1">
      <summary className="cursor-pointer font-semibold text-zinc-100">{title}</summary>
      <div className="mt-1 grid gap-1">
        {(["x", "y", "z"] as const).map((a) => (
          <Row
            key={a}
            label={a.toUpperCase()}
            value={value[a]}
            def={def[a]}
            min={min}
            max={max}
            onChange={(v) => onChange({ ...value, [a]: v })}
          />
        ))}
      </div>
    </details>
  );
}

function usePanelForce() {
  const [, force] = useReducer((x: number) => x + 1, 0);
  return () => {
    savePose(livePose.current);
    touchPose();
    force();
  };
}

const FINGER_ORDER = [
  { key: "thumb", label: "Jempol" },
  { key: "index", label: "Telunjuk" },
  { key: "middle", label: "Tengah" },
  { key: "ring", label: "Manis" },
  { key: "little", label: "Kelingking" },
] as const;

const FINGER_PRESETS: Array<{ label: string; v: HandState }> = [
  { label: "Buka", v: { thumb: 0, index: 0, middle: 0, ring: 0, little: 0, spread: 0.8 } },
  { label: "Genggam", v: { thumb: 1, index: 1, middle: 1, ring: 1, little: 1, spread: 0 } },
  { label: "Peace", v: { thumb: 0.6, index: 0, middle: 0, ring: 1, little: 1, spread: 0.5 } },
  { label: "Tunjuk", v: { thumb: 0.8, index: 0, middle: 1, ring: 1, little: 1, spread: 0.2 } },
  { label: "Jempol", v: { thumb: 0.1, index: 1, middle: 1, ring: 1, little: 1, spread: 0.3 } },
];

function HandGroup(props: {
  title: string;
  value: HandState;
  def: HandState;
  onChange: (v: HandState) => void;
}) {
  const { title, value, def, onChange } = props;
  return (
    <details className="rounded border border-white/10 px-1.5 py-1">
      <summary className="cursor-pointer font-semibold text-zinc-100">{title}</summary>
      <div className="mt-1 grid gap-1">
        {FINGER_ORDER.map((f) => (
          <Row
            key={f.key}
            label={f.label}
            value={value[f.key]}
            def={def[f.key]}
            min={-1}
            max={2}
            onChange={(v) => onChange({ ...value, [f.key]: v })}
          />
        ))}
        <Row
          label="Mekar"
          value={value.spread}
          def={def.spread}
          min={-1}
          max={1}
          onChange={(v) => onChange({ ...value, spread: v })}
        />
      </div>
    </details>
  );
}

function PanelShell(props: {
  title: string;
  changed: boolean;
  onHide: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{ pointerEvents: "auto" }}
      className="z-30 max-h-[72vh] w-60 overflow-y-auto rounded-lg bg-black/85 p-2.5 text-[11px] text-white shadow-xl"
    >
      <div className="mb-1 flex items-center justify-between">
        <p className="font-bold">
          {props.title} {props.changed ? "(diubah)" : ""}
        </p>
        <button
          type="button"
          onClick={props.onHide}
          className="rounded bg-white/10 px-1.5 py-0.5"
        >
          Hide
        </button>
      </div>
      {props.children}
    </div>
  );
}

export function PosePanel() {
  const commit = usePanelForce();
  const [hidden, setHidden] = useState(false);
  const [copied, setCopied] = useState(false);
  const [cardsHidden, setCardsHidden] = useState(true);
  const P = livePose.current;
  const D = defaultPose;

  // Kartu skill langsung di-hide pas panel kebuka (visibility biar layout
  // pin ScrollTrigger tidak jebol), dibalikin pas panel unmount.
  useEffect(() => {
    const el = document.querySelector<HTMLElement>("[data-skill-track]");
    if (el) el.style.visibility = "hidden";
    return () => {
      const back = document.querySelector<HTMLElement>("[data-skill-track]");
      if (back) back.style.visibility = "";
    };
  }, []);

  const toggleCards = () => {
    const next = !cardsHidden;
    setCardsHidden(next);
    const el = document.querySelector<HTMLElement>("[data-skill-track]");
    if (el) el.style.visibility = next ? "hidden" : "";
  };

  if (hidden) {
    return (
      <button
        type="button"
        onClick={() => setHidden(false)}
        style={{ pointerEvents: "auto" }}
        className="absolute bottom-2 left-2 z-30 rounded-lg bg-black/80 px-3 py-1.5 text-[11px] font-bold text-white"
      >
        Badan
      </button>
    );
  }

  const changed = JSON.stringify(P) !== JSON.stringify(D);

  return (
    <div className="absolute bottom-2 left-2">
      <PanelShell title="Furina Badan" changed={changed} onHide={() => setHidden(true)}>
        <div className="mb-1 grid gap-1">
          <Row label="Pos X" value={P.group.x} def={D.group.x} min={-2} max={2} onChange={(v) => { P.group.x = v; commit(); }} />
          <Row label="Pos Y" value={P.group.y} def={D.group.y} min={-3} max={0} onChange={(v) => { P.group.y = v; commit(); }} />
          <Row label="Hadap (yaw)" value={P.group.yaw} def={D.group.yaw} min={-3.14} max={3.14} onChange={(v) => { P.group.yaw = v; commit(); }} />
          <Row label="Ukuran char" value={P.group.scale} def={D.group.scale} min={0.5} max={2.5} onChange={(v) => { P.group.scale = v; commit(); }} />
          <Row label="Boost bareng (+kursi)" value={P.boost} def={D.boost} min={0.5} max={2} step={0.05} onChange={(v) => { P.boost = v; commit(); }} />
          <Row label="Halus (smooth)" value={P.smooth} def={D.smooth} min={1} max={20} step={0.5} onChange={(v) => { P.smooth = v; commit(); }} />
          <Row label="Goyang (micro)" value={P.micro} def={D.micro} min={0} max={1.5} onChange={(v) => { P.micro = v; commit(); }} />
        </div>

        <div className="grid gap-1">
          <details className="rounded border border-white/10 px-1.5 py-1">
            <summary className="cursor-pointer font-semibold text-zinc-100">Kursi plastik</summary>
            <div className="mt-1 grid gap-1">
              <Row label="X" value={P.chair.x} def={D.chair.x} min={-3} max={3} onChange={(v) => { P.chair.x = v; commit(); }} />
              <Row label="Y" value={P.chair.y} def={D.chair.y} min={-3} max={1} onChange={(v) => { P.chair.y = v; commit(); }} />
              <Row label="Z" value={P.chair.z} def={D.chair.z} min={-3} max={3} onChange={(v) => { P.chair.z = v; commit(); }} />
              <Row label="Arah (yaw)" value={P.chair.yaw} def={D.chair.yaw} min={-3.14} max={3.14} onChange={(v) => { P.chair.yaw = v; commit(); }} />
              <Row label="Ukuran kursi" value={P.chair.scale} def={D.chair.scale} min={0.3} max={2.5} onChange={(v) => { P.chair.scale = v; commit(); }} />
            </div>
          </details>
          <Axes title="Dada" value={P.chest} def={D.chest} onChange={(v) => { P.chest = v; commit(); }} />
          <Axes title="Pinggul" value={P.hips} def={D.hips} onChange={(v) => { P.hips = v; commit(); }} />
          <Axes title="Kepala" value={P.head} def={D.head} onChange={(v) => { P.head = v; commit(); }} />
          <Axes title="Lengan atas Kiri" value={P.upperArmL} def={D.upperArmL} onChange={(v) => { P.upperArmL = v; commit(); }} />
          <Axes title="Siku Kiri" value={P.elbowL} def={D.elbowL} onChange={(v) => { P.elbowL = v; commit(); }} />
          <Axes title="Tangan Kiri" value={P.wristL} def={D.wristL} min={-1} max={1} onChange={(v) => { P.wristL = v; commit(); }} />
          <Axes title="Lengan atas Kanan" value={P.upperArmR} def={D.upperArmR} onChange={(v) => { P.upperArmR = v; commit(); }} />
          <Axes title="Siku Kanan" value={P.elbowR} def={D.elbowR} onChange={(v) => { P.elbowR = v; commit(); }} />
          <Axes title="Tangan Kanan" value={P.wristR} def={D.wristR} min={-1} max={1} onChange={(v) => { P.wristR = v; commit(); }} />
          <Axes title="Paha Kiri" value={P.thighL} def={D.thighL} onChange={(v) => { P.thighL = v; commit(); }} />
          <Axes title="Lutut Kiri" value={P.kneeL} def={D.kneeL} onChange={(v) => { P.kneeL = v; commit(); }} />
          <Axes title="Kaki Kiri" value={P.ankleL} def={D.ankleL} min={-1} max={1} onChange={(v) => { P.ankleL = v; commit(); }} />
          <Axes title="Paha Kanan" value={P.thighR} def={D.thighR} onChange={(v) => { P.thighR = v; commit(); }} />
          <Axes title="Lutut Kanan" value={P.kneeR} def={D.kneeR} onChange={(v) => { P.kneeR = v; commit(); }} />
          <Axes title="Kaki Kanan" value={P.ankleR} def={D.ankleR} min={-1} max={1} onChange={(v) => { P.ankleR = v; commit(); }} />
          <details className="rounded border border-white/10 px-1.5 py-1">
            <summary className="cursor-pointer font-semibold text-zinc-100">Jari Tangan</summary>
            <div className="mt-1 grid gap-1">
              <div className="flex flex-wrap gap-1">
                {FINGER_PRESETS.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => {
                      P.handL = { ...p.v };
                      P.handR = { ...p.v };
                      commit();
                    }}
                    className="rounded bg-white/15 px-2 py-0.5 font-semibold"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <HandGroup title="Jari Kiri" value={P.handL} def={D.handL} onChange={(v) => { P.handL = v; commit(); }} />
              <HandGroup title="Jari Kanan" value={P.handR} def={D.handR} onChange={(v) => { P.handR = v; commit(); }} />
            </div>
          </details>
        </div>

        <div className="mt-2 grid gap-1.5">
          <button
            type="button"
            onClick={toggleCards}
            className="rounded bg-amber-400/20 px-2 py-1 font-semibold text-amber-200"
          >
            {cardsHidden ? "Munculin kartu" : "Sembunyiin kartu"}
          </button>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(JSON.stringify(livePose.current));
                  setCopied(true);
                  window.setTimeout(() => setCopied(false), 1500);
                } catch {
                  /* clipboard diblokir */
                }
              }}
              className="flex-1 rounded bg-white/15 px-2 py-1 font-semibold"
            >
              {copied ? "Tersalin!" : "Copy JSON"}
            </button>
            <button
              type="button"
              onClick={() => { resetPose(); commit(); }}
              className="flex-1 rounded bg-white/10 px-2 py-1"
            >
              Reset
            </button>
          </div>
        </div>
        <p className="mt-1 text-[10px] text-zinc-400">SS panel ini / Copy JSON kirim ke aku.</p>
      </PanelShell>
    </div>
  );
}

export function FacePanel() {
  const commit = usePanelForce();
  const [hidden, setHidden] = useState(false);
  const P = livePose.current;
  const D = defaultPose;

  if (hidden) {
    return (
      <button
        type="button"
        onClick={() => setHidden(false)}
        style={{ pointerEvents: "auto" }}
        className="absolute bottom-2 right-2 z-30 rounded-lg bg-black/80 px-3 py-1.5 text-[11px] font-bold text-white"
      >
        Wajah
      </button>
    );
  }

  const changed = JSON.stringify(P.face) !== JSON.stringify(D.face);

  return (
    <div className="absolute bottom-2 right-2">
      <PanelShell title="Furina Wajah" changed={changed} onHide={() => setHidden(true)}>
        <div className="grid gap-1">
          <Row label="Lirik atas-bawah" value={P.face.eyeX} def={D.face.eyeX} min={-0.6} max={0.6} onChange={(v) => { P.face.eyeX = v; commit(); }} />
          <Row label="Lirik kiri-kanan" value={P.face.eyeY} def={D.face.eyeY} min={-0.6} max={0.6} onChange={(v) => { P.face.eyeY = v; commit(); }} />
          <Row label="Merem manual" value={P.face.blink} def={D.face.blink} min={0} max={1} onChange={(v) => { P.face.blink = v; commit(); }} />
          <Row label="Senyum" value={P.face.smile} def={D.face.smile} min={0} max={2} step={0.05} onChange={(v) => { P.face.smile = v; commit(); }} />
          <label className="flex items-center justify-between gap-2 text-zinc-300">
            <span>Kedip otomatis</span>
            <input
              type="checkbox"
              checked={P.face.auto}
              onChange={(e) => { P.face.auto = e.target.checked; commit(); }}
            />
          </label>
        </div>
      </PanelShell>
    </div>
  );
}

export function shouldShowPosePanel() {
  if (typeof window === "undefined") return false;
  if (window.location.hostname === "localhost") return true;
  try {
    return new URLSearchParams(window.location.search).has("pose");
  } catch {
    return false;
  }
}
