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
      { rootMargin: "800px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

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
          dpr={[1, 1.5]}
          gl={{ alpha: true, antialias: true }}
          camera={{ position: [0, 0.35, 3.2], fov: 34 }}
          style={{ background: "transparent" }}
          onCreated={({ gl }) => {
            gl.setClearColor(0x000000, 0);
          }}
        >
          {/* lights: hemat, tanpa HDRI download */}
          <hemisphereLight intensity={0.9} args={[0xfff6e5, 0x1a1025, 0.9]} />
          <directionalLight position={[2.5, 4, 2]} intensity={1.15} />
          <directionalLight position={[-2, 1.5, 2]} intensity={0.45} />
          <ambientLight intensity={0.35} />

          <Suspense fallback={null}>
            <CharModel progressRef={progressRef} mouseRef={mouseRef} reduced={reduce ?? false} />
          </Suspense>
        </Canvas>
      )}
    </div>
  );
}
