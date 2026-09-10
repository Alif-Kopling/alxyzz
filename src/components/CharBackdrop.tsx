import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { useReducedMotion } from "motion/react";
import { CharModel } from "./CharModel";

type Props = {
  progressRef: React.MutableRefObject<number>;
};

export function CharBackdrop({ progressRef }: Props) {
  const reduce = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [inView, setInView] = useState(true);
  const mouseRef = useRef({ x: 0, y: 0 });

  // gate: hanya mount Canvas saat section dekat viewport (hemat chunk & GPU first paint)
  useEffect(() => {
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
  }, []);

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
          frameloop={inView ? "always" : "never"}
          gl={{ alpha: true, antialias: false, stencil: false, powerPreference: "low-power" }}
          camera={{ position: [0, 0.35, 3.2], fov: 34 }}
          style={{ background: "transparent" }}
          onCreated={({ gl }) => {
            gl.setClearColor(0x000000, 0);
          }}
        >
          {/* lights: 2 saja (hemat shader) + tanpa HDRI download */}
          <hemisphereLight intensity={0.9} args={[0xfff6e5, 0x1a1025, 0.9]} />
          <directionalLight position={[2.5, 4, 2]} intensity={1.35} />

          <Suspense fallback={null}>
            <CharModel progressRef={progressRef} mouseRef={mouseRef} reduced={reduce ?? false} />
          </Suspense>
        </Canvas>
      )}
    </div>
  );
}
