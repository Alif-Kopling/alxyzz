import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { useReducedMotion } from "motion/react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
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
      {/* BG custom di belakang canvas 3D (canvas transparan) */}
      <img
        src="/bg-furina.png"
        alt=""
        aria-hidden="true"
        loading="eager"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[#09090b]/45 [background:radial-gradient(ellipse_90%_80%_at_50%_40%,transparent_40%,rgb(9_9_11/0.55)_100%)]"
      />
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
            gl.toneMappingExposure = 1.08;
          }}
        >
          {/* Env prosedural (tanpa download HDR): highlight rambut/gold/mata
              jadi hidup. Sekali jalan pas mount (di balik portal), nol cost
              per-frame. Intensity direndahin biar tone warm dari lampu yang mimpin. */}
          <Env intensity={0.35} />
          {/* key warm + rim biru ala Furina + fill hangat biar kulit tidak abu pucat */}
          <hemisphereLight intensity={0.6} args={[0xffe3c0, 0x3a2418, 0.6]} />
          <directionalLight position={[2.5, 4, 2]} intensity={1.35} color={0xffd2a0} />
          <directionalLight position={[-2.5, 2.5, -2]} intensity={1.2} color={0x8ea2ff} />
          <directionalLight position={[-1.5, 1, 2.5]} intensity={0.55} color={0xffab66} />

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

/** Image-based lighting prosedural: kaya tanpa nambah lampu real-time. */
function Env({ intensity = 0.5 }: { intensity?: number }) {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const rt = pmrem.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = rt.texture;
    scene.environmentIntensity = intensity;
    return () => {
      scene.environment = null;
      scene.environmentIntensity = 1;
      rt.dispose();
      pmrem.dispose();
    };
  }, [gl, scene, intensity]);
  return null;
}

function ChairModel() {
  const { scene } = useGLTF("/chair.glb");
  // Kursi plastik sengaja — buat komedi. Posisi/yaw/scale ngikut panel tuning.
  const c = livePose.current.chair;
  return <primitive object={scene} position={[c.x, c.y, c.z]} rotation={[0, c.yaw, 0]} scale={c.scale} />;
}

useGLTF.preload("/chair.glb");
