import { useEffect, useRef, useState } from "react";
import type { CSSProperties, RefObject } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion, useReducedMotion } from "motion/react";
import { trail } from "../data/wanted";
import { Reveal } from "./Reveal";

gsap.registerPlugin(ScrollTrigger);

// Koordinat titik: SD asli + SMK dari data Kemendikdasmen, sisanya perkiraan wajar
// (label peta jujur: sketsa, bukan skala — jangan kutip angka ini di UI).
// Catatan: file ini sengaja tanpa template literal (pakai concat biasa).
const RAW = [
  { lng: 107.6759, lat: -6.5253, anchor: "middle" as const, dx: 0, dy: -22, tag: "SDN 1 KALIJATI" },
  { lng: 107.6555, lat: -6.5255, anchor: "middle" as const, dx: 12, dy: 38, tag: "SMPN 1 KALIJATI" },
  { lng: 107.7358, lat: -6.5476, anchor: "middle" as const, dx: 0, dy: -24, tag: "SMKN 2 SUBANG" },
  { lng: 107.758, lat: -6.56, anchor: "start" as const, dx: -5, dy: -18, tag: "PT GOTHRU MEDIA INDONESIA" },
  { lng: 107.845, lat: -6.585, anchor: "end" as const, dx: -12, dy: -18, tag: "???" },
];

// Peta landscape lebar: satu-satunya isi section.
const VB_W = 640;
const VB_H = 400;
const MIN_LNG = Math.min.apply(null, RAW.map(function (r) { return r.lng; }));
const MAX_LNG = Math.max.apply(null, RAW.map(function (r) { return r.lng; }));
const MIN_LAT = Math.min.apply(null, RAW.map(function (r) { return r.lat; }));
const MAX_LAT = Math.max.apply(null, RAW.map(function (r) { return r.lat; }));

function project(lng: number, lat: number) {
  const x = 56 + ((lng - MIN_LNG) / (MAX_LNG - MIN_LNG)) * (VB_W - 112);
  const y = 60 + ((MAX_LAT - lat) / (MAX_LAT - MIN_LAT)) * (VB_H - 120);
  return { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 };
}

const STOPS = trail.map(function (s, i) {
  const p = project(RAW[i].lng, RAW[i].lat);
  const last = i === trail.length - 1;
  return {
    stage: s.stage,
    place: s.place,
    desc: s.desc,
    x: p.x,
    y: p.y,
    anchor: RAW[i].anchor,
    dx: RAW[i].dx,
    dy: RAW[i].dy,
    tag: RAW[i].tag,
    // Titik terakhir belum tertangkap: pin kopong bertanda tanya.
    unknown: last,
    no: last ? "?" : String(i + 1),
  };
});

// Kurva halus Catmull-Rom lewat semua titik, tanpa lib tambahan.
function smoothPath(pts: Array<{ x: number; y: number }>) {
  let d = "M" + pts[0].x + "," + pts[0].y;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += "C" + c1x.toFixed(1) + "," + c1y.toFixed(1) + " " + c2x.toFixed(1) + "," + c2y.toFixed(1) + " " + p2.x + "," + p2.y;
  }
  return d;
}

const D = smoothPath(STOPS);

function RouteMap({
  mode,
  pathRef,
  markerRef,
  setPin,
}: {
  mode: "scrub" | "static";
  pathRef?: RefObject<SVGPathElement | null>;
  markerRef?: RefObject<SVGGElement | null>;
  setPin?: (i: number) => (el: SVGGElement | null) => void;
}) {
  const markerAt = mode === "static" ? STOPS[STOPS.length - 1] : STOPS[0];
  const pinClass = mode === "static" ? "map-pin is-active" : "map-pin";
  return (
    <svg viewBox={"0 0 " + VB_W + " " + VB_H} role="img" aria-label="Peta sketsa rute pelarian" className="h-auto w-full">
      <rect x={10} y={10} width={VB_W - 20} height={VB_H - 20} fill="none" stroke="#16130e" strokeOpacity={0.25} />
      {/* Jalan dekoratif abstrak, tanpa nama biar tidak ngarang geografi */}
      <polyline points="24,318 300,272 616,306" fill="none" stroke="#16130e" strokeOpacity={0.14} strokeWidth={2} />
      <polyline points="200,18 258,210 232,382" fill="none" stroke="#16130e" strokeOpacity={0.14} strokeWidth={2} />
      {/* Mawar kompas */}
      <g transform="translate(586,80)" stroke="#16130e">
        <circle r={15} fill="none" strokeOpacity={0.4} />
        <path d="M0,-9 L4,4 L0,1 L-4,4 Z" fill="#16130e" />
        <text y={-20} textAnchor="middle" fontSize={11} fontFamily="monospace" fontWeight="bold" fill="#16130e" stroke="none">
          U
        </text>
      </g>
      {/* Rute dasar + overlay yang digambar pas scroll */}
      <path d={D} fill="none" stroke="#16130e" strokeOpacity={0.25} strokeWidth={3} strokeLinecap="round" strokeDasharray="2 7" />
      <path
        ref={pathRef}
        d={D}
        fill="none"
        stroke="#b3271e"
        strokeWidth={3.5}
        strokeLinecap="round"
      />
      {/* Pin bernomor */}
      {STOPS.map(function (s, i) {
        const setRef = setPin ? setPin(i) : undefined;
        return (
          <g
            key={s.stage}
            ref={setRef}
            className={pinClass + (s.unknown ? " unknown" : "")}
          >
            <circle className="pin-dot" cx={s.x} cy={s.y} r={12} />
            <text x={s.x} y={s.y + 4.5} textAnchor="middle" fontSize={12} fontWeight="bold" fontFamily="monospace">
              {s.no}
            </text>
            <text
              x={s.x + s.dx}
              y={s.y + s.dy}
              textAnchor={s.anchor}
              fontSize={11}
              fontFamily="monospace"
              letterSpacing={1.5}
              fill="#4a4438"
              stroke="#faf7ef"
              strokeWidth={5}
              style={{ paintOrder: "stroke" }}
            >
              {s.tag}
            </text>
          </g>
        );
      })}
      {/* Marker buron */}
      <g ref={markerRef} transform={"translate(" + markerAt.x + "," + markerAt.y + ")"}>
        <circle className="marker-ring" r={10} fill="none" stroke="#b3271e" strokeWidth={2.5} />
        <circle r={6} fill="#b3271e" stroke="#faf7ef" strokeWidth={2} />
      </g>
      {/* Stempel sektor */}
      <g transform="rotate(-8 110 368)">
        <rect x={50} y={355} width={120} height={26} fill="none" stroke="#b3271e" strokeWidth={2} />
        <text x={110} y={373} textAnchor="middle" fontSize={12} fontWeight="bold" fontFamily="monospace" letterSpacing={2} fill="#b3271e">
          SUBANG SECTOR
        </text>
      </g>
      <text x={VB_W - 20} y={VB_H - 20} textAnchor="end" fontSize={9} fontFamily="monospace" letterSpacing={1.5} fill="#4a4438">
        SKETSA — BUKAN SKALA
      </text>
    </svg>
  );
}

// Jejak pelarian: section full-map di-pin — scroll dihabiskan menggambar rute,
// keterangan muncul sebagai popover di pin yang baru dicapai.
export function TrailTimeline() {
  const pinRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement | null>(null);
  const markerRef = useRef<SVGGElement | null>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef<HTMLDivElement>(null);
  const popWrapRef = useRef<HTMLDivElement>(null);
  const stampRef = useRef<HTMLDivElement>(null);
  const exitRef = useRef<HTMLDivElement>(null);
  const pinEls = useRef<Array<SVGGElement | null>>([]);
  const idxRef = useRef(0);
  const [activeIdx, setActiveIdx] = useState(0);
  const reduce = useReducedMotion();

  function setPin(i: number) {
    return function (el: SVGGElement | null) {
      pinEls.current[i] = el;
    };
  }

  useEffect(function () {
    if (reduce || !pinRef.current || !pathRef.current || !markerRef.current) return;
    const path = pathRef.current;
    const marker = markerRef.current;
    const bar = barRef.current;
    const len = path.getTotalLength();
    path.style.strokeDasharray = String(len);
    path.style.strokeDashoffset = String(len);
    // Fraksi progres saat marker TIBA di tiap titik, diukur dari path asli
    // (sampling 400 titik). Segment panjang-pendek beda jauh, jadi bagi-rata
    // bikin pin telat/kecepetan.
    const arrivals: number[] = STOPS.map(function (s) {
      const SAMPLES = 400;
      let best = 0;
      let bestD = Infinity;
      for (let k = 0; k <= SAMPLES; k++) {
        const pt = path.getPointAtLength((k / SAMPLES) * len);
        const dx = pt.x - s.x;
        const dy = pt.y - s.y;
        const d = dx * dx + dy * dy;
        if (d < bestD) {
          bestD = d;
          best = k / SAMPLES;
        }
      }
      return best;
    });
    const LEAD = 0.02;
    // Fase 1 (0 → ROUTE_END): rute digambar. Fase 2: kamera zoom ke titik MISSING.
    const ROUTE_END = 0.55;
    const ZOOM_END = 0.8;
    const ZOOM_MAX = 3.0;
    function draw(p: number) {
      const cl = Math.max(0, Math.min(1, p));
      const rp = Math.min(1, cl / ROUTE_END);
      const zpRaw = (cl - ROUTE_END) / (ZOOM_END - ROUTE_END);
      const zp = Math.max(0, Math.min(1, zpRaw));
      const ze = zp * zp * (3 - 2 * zp);
      path.style.strokeDashoffset = String(len * (1 - rp));
      const pt = path.getPointAtLength(rp * len);
      marker.setAttribute("transform", "translate(" + pt.x + "," + pt.y + ")");
      if (bar) bar.style.transform = "scaleX(" + cl + ")";
      const zoomEl = zoomRef.current;
      if (zoomEl) zoomEl.style.transform = "scale(" + (1 + ZOOM_MAX * ze) + ")";
      const popEl = popWrapRef.current;
      if (popEl) popEl.style.opacity = String(1 - Math.min(1, zp / 0.25));
      const stampEl = stampRef.current;
      if (stampEl) stampEl.style.opacity = String(Math.max(0, Math.min(1, (zp - 0.5) / 0.5)));
      // Fase 3 (ujung pin): kartu peta exit diagonal kiri-atas + fade,
      // section Pengakuan masuk dari bawah. Reverse otomatis pas scroll balik.
      const EXIT_START = 0.88;
      const epRaw = (cl - EXIT_START) / (1 - EXIT_START);
      const ep = Math.max(0, Math.min(1, epRaw));
      const ee = ep * ep * (3 - 2 * ep);
      const exitEl = exitRef.current;
      if (exitEl) {
        exitEl.style.transform = "translate(" + (-6 * ee) + "dvw," + (-16 * ee) + "dvh)";
        exitEl.style.opacity = String(1 - ee);
      }
      let idx = 0;
      for (let i = 0; i < arrivals.length; i++) {
        if (rp >= arrivals[i] - LEAD) idx = i;
      }
      if (idx !== idxRef.current) {
        idxRef.current = idx;
        setActiveIdx(idx);
      }
      pinEls.current.forEach(function (el, i) {
        if (el) el.classList.toggle("is-active", i <= idx);
      });
    }
    draw(0);
    const st = ScrollTrigger.create({
      trigger: pinRef.current,
      start: "top top+=84",
      end: "+=400%",
      pin: true,
      scrub: 0.6,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: function (self) {
        draw(self.progress);
      },
    });
    return function () {
      st.kill();
    };
  }, [reduce]);

  const active = trail[activeIdx];
  const stop = STOPS[activeIdx];
  const fx = (stop.x / VB_W) * 100;
  const rawFy = (stop.y / VB_H) * 100;
  // Pin di sepertiga atas: popover dibuka ke bawah pin biar tidak
  // menimpa label SDN/SMPN yang duduk di kanan pin.
  const below = rawFy < 30;
  const fy = below ? Math.max(10, rawFy) : Math.min(78, Math.max(22, rawFy));
  const popClass = "checkpoint-pop" + (fx > 55 ? " flip-x" : "") + (below ? " below" : "");
  const popStyle = { "--px": fx + "%", "--py": fy + "%" } as CSSProperties;
  const lastStop = STOPS[STOPS.length - 1];
  const zoomOrigin = (lastStop.x / VB_W) * 100 + "% " + (lastStop.y / VB_H) * 100 + "%";

  return (
    <section id="jejak" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-16 md:px-6 md:py-24">
      <Reveal>
        <h2 className="font-display max-w-[16ch] text-3xl font-extrabold tracking-tighter text-ink uppercase md:text-4xl">
          Jejak Pelarian
        </h2>
        <p className="mt-3 max-w-[52ch] text-base leading-relaxed text-ink-soft">
          Dari Kalijati sampai meja kerja. Tahan scroll — rute kabur digambar sampai tuntas.
        </p>
      </Reveal>

      {reduce ? (
        <div className="mt-10 grid gap-6">
          <div className="paper-raised card-dossier mx-auto w-[95%] bg-paper-card p-3 md:p-4">
            <RouteMap mode="static" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {trail.map(function (s, i) {
              return (
                <article key={s.stage} className="trail-item is-active">
                  <div className="card-dossier h-full border border-ink/20 bg-paper-card p-4">
                    <p className="font-mono text-[11px] font-bold tracking-[0.2em] text-stamp uppercase">
                      Titik {i + 1} — {s.stage}
                    </p>
                    <h3 className="font-display mt-1.5 text-lg leading-snug font-extrabold tracking-tight text-ink">
                      {s.place}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{s.desc}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      ) : (
        <div ref={pinRef} className="relative mt-10">
          <div ref={exitRef} className="paper-raised card-dossier relative mx-auto mb-8 w-[95%] bg-paper-card p-2 will-change-transform md:p-3">
            <div className="relative overflow-hidden">
              <div ref={zoomRef} className="will-change-transform" style={{ transformOrigin: zoomOrigin }}>
                <RouteMap mode="scrub" pathRef={pathRef} markerRef={markerRef} setPin={setPin} />
              </div>
            </div>
            {/* Bar progres + penanda titik */}
            <div className="absolute inset-x-0 top-0 p-4 md:p-5">
              <div className="h-[3px] w-full bg-ink/10">
                <div
                  ref={barRef}
                  className="h-full w-full origin-left bg-stamp"
                  style={{ transform: "scaleX(0)" }}
                />
              </div>
              <div className="mt-2 flex items-center justify-between gap-2">
                <span className="border border-ink/25 bg-paper/90 px-2.5 py-1 font-mono text-[10px] font-bold tracking-[0.2em] text-ink uppercase">
                  Jejak pelarian
                </span>
                <span className="border border-ink/25 bg-paper/90 px-2.5 py-1 font-mono text-[10px] font-bold tracking-[0.2em] text-ink uppercase">
                  Titik {activeIdx + 1}/5
                </span>
              </div>
            </div>
            {/* Popover checkpoint: nempel pin aktif, flip otomatis */}
            <div ref={popWrapRef} className={popClass} style={popStyle}>
              <motion.div
                key={activeIdx}
                initial={{ opacity: 0, y: 14, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="card-dossier border border-ink/25 bg-paper-card p-4 shadow-[4px_4px_0_rgb(22_19_14/0.9)]"
              >
                <p className="font-mono text-[10px] font-bold tracking-[0.2em] text-stamp uppercase">
                  Titik {activeIdx + 1} — {active.stage}
                </p>
                <h3 className="font-display mt-1 text-base font-extrabold tracking-tight text-ink">
                  {active.place}
                </h3>
                <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">{active.desc}</p>
              </motion.div>
            </div>
            <div
              ref={stampRef}
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center"
              style={{ opacity: 0 }}
            >
              <span className="-rotate-6 border-[3px] border-stamp bg-paper/80 px-4 py-2 font-mono text-lg font-bold tracking-[0.2em] text-stamp uppercase outline-1 outline-stamp outline-offset-2 md:text-xl">
                Buron belum tertangkap
              </span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
