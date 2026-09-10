import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { useReducedMotion } from "motion/react";
import { CharModel } from "./CharModel";
import { livePose, usePoseVersion } from "./charPose";
import { FacePanel, PosePanel } from "./PosePanel";
import { dimensionStore, isDimensionReady, useDimensionVersion } from "../lib/dimension";

type Props = {
  progressRef: React.MutableRefObject<number>;
};

export function CharBackdrop({ progressRef }: Props) {
  const reduce = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [inView, setInView] = useState(true);
  const mouseRef = useRef({ x: 0, y: 0 });
  // Panel tuning disembunyiin — muncul cuma via shortcut rahasia Ctrl+Alt+,
  const [tuningOn, setTuningOn] = useState(false);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.altKey && e.key === ",") {
        e.preventDefault();
        setTuningOn((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  // ikut re-render pas panel tuning digeser (kursi + boost dibaca live)
  usePoseVersion();
  // ikut re-render pas portal menandai eager / 3D ready
  useDimensionVersion();
  const eager = dimensionStore.eager;
  const warmed = isDimensionReady();
  const boost = livePose.current.boost ?? 1.3;
  // pivot titik dudukan (y≈-1.05) + turun 0.12 biar ujung topi tidak kepotong
  const boostY = -1.05 * (1 - boost) - 0.12;

  // gate: hanya mount Canvas saat section dekat viewport (hemat chunk & GPU first paint).
  // Portal bisa memaksa eager mount lebih awal (offscreen, di balik overlay)
  // biar compile shader + frame pertama kelar sebelum zoom-out.
  useEffect(() => {
    if (eager) {
      setVisible(true);
      return;
    }
    const el = containerRef.current?.parentElement;
    if (!el) {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) setVisible(true);
      },
      { rootMargin: "500px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [eager]);

  // pause render saat section keluar viewport (CPU/GPU → 0).
  // Mount gate di atas cuma sekali; ini bolak-balik mengikuti scroll.
  useEffect(() => {
    if (!visible) return;
    const el = containerRef.current?.parentElement;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        setInView(entries[0]?.isIntersecting ?? true);
      },
      { rootMargin: "100px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [visible]);

  // mouse follow (normalized -1..1) — pointer-events-none jadi listen di parent section
  useEffect(() => {
    const el = containerRef.current?.parentElement;
    if (!el || reduce) return;
    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouseRef.current.x = Math.max(-1, Math.min(1, x));
      mouseRef.current.y = Math.max(-1, Math.min(1, y * 0.6));
    };
    el.addEventListener("pointermove", onMove);
    return () => el.removeEventListener("pointermove", onMove);
  }, [reduce]);

  // reduced motion → statis: CharModel langsung pasang pose final tanpa sway (lihat prop reduced)
  // Canvas pointer-events-none biar tidak nyolong scroll/touch kartu

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      {visible && (
        <Canvas
          // Ringan: DPR max 1, tanpa antialias (backdrop di balik kartu, beda visual minim),
          // GPU low-power. Render 0 saat section di luar viewport (lihat frameloop + inView).
          dpr={[0.8, 1]}
          frameloop={inView || (eager && !warmed) ? "always" : "never"}
          gl={{ alpha: true, antialias: false, stencil: false, powerPreference: "low-power" }}
          camera={{ position: [0, 0.05, 3.7], fov: 32 }}
          style={{ background: "transparent" }}
          onCreated={({ gl }) => {
            gl.setClearColor(0x000000, 0);
          }}
        >
          {/* key warm + rim biru ala Furina + fill lembut biar kulit tidak abu pucat */}
          <hemisphereLight intensity={0.85} args={[0xfff6e5, 0x1a1025, 0.85]} />
          <directionalLight position={[2.5, 4, 2]} intensity={1.25} color={0xfff1dd} />
          <directionalLight position={[-2.5, 2.5, -2]} intensity={1.1} color={0x8ea2ff} />
          <directionalLight position={[-1.5, 1, 2.5]} intensity={0.35} color={0xffd9b0} />

          <Suspense fallback={null}>
            {/* Boost +30%: char + kursi di-scale BARENG dari titik dudukan
                (y≈-1.05) biar pantat tetap nangkring; assembly
                diturunin 0.12 biar ujung topi tidak kepotong atas layar.
                Scale uniform → arah world-space solve pose tidak berubah. */}
            <group position={[0, boostY, 0]} scale={boost}>
              <ChairModel />
              <CharModel progressRef={progressRef} mouseRef={mouseRef} reduced={reduce ?? false} />
            </group>
          </Suspense>
        </Canvas>
      )}
      {visible && tuningOn && (
        <>
          <PosePanel />
          <FacePanel />
        </>
      )}
    </div>
  );
}

function ChairModel() {
  const { scene } = useGLTF("/chair.glb");
  // Kursi plastik sengaja — buat komedi. Posisi/yaw/scale ngikut panel tuning.
  const c = livePose.current.chair;
  return <primitive object={scene} position={[c.x, c.y, c.z]} rotation={[0, c.yaw, 0]} scale={c.scale} />;
}

useGLTF.preload("/chair.glb");
