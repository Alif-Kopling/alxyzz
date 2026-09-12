import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useReducedMotion } from "motion/react";

interface WantedPoster3DProps {
  photoUrl?: string;
  name?: string;
  code?: string;
  reward?: string;
  location?: string;
}

function isWebGLAvailable() {
  if (typeof window === "undefined") return true;
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl2") || canvas.getContext("webgl"))
    );
  } catch {
    return false;
  }
}

export function WantedPoster3D({
  photoUrl = "/my-photo.webp",
  name = "ALXYZZ",
  code = "ALX-017",
  reward = "REWARD: 3 NETHERITE INGOTS",
  location = "Terakhir terlihat: Subang",
}: WantedPoster3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();
  const [webGlSupported] = useState(isWebGLAvailable);

  useEffect(() => {
    if (!webGlSupported) return;
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let isVisible = true;
    let animationFrameId: number;

    // 1. Scene setup
    const scene = new THREE.Scene();

    // 2. Camera setup
    const fov = 42;
    const aspect = container.clientWidth / container.clientHeight;
    const camera = new THREE.PerspectiveCamera(fov, aspect, 0.1, 100);
    camera.position.set(0, 0, 6.2);

    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: !isMobile, // antialias on desktop, disabled on low-power mobile
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    // On-demand shadow updates: cuts 50% continuous draw calls when idle
    renderer.shadowMap.autoUpdate = false;
    renderer.shadowMap.needsUpdate = true;

    // 4. Lighting (Warm Archival Desk Lamp)
    const ambientLight = new THREE.AmbientLight(0xfffaed, 1.4);
    scene.add(ambientLight);

    // Main Spotlight / Directional Desk Lamp
    const deskLamp = new THREE.SpotLight(0xfff1cf, 3.8);
    deskLamp.position.set(2.8, 4.5, 4.5);
    deskLamp.angle = Math.PI / 4.5;
    deskLamp.penumbra = 0.6;
    deskLamp.decay = 1.2;
    deskLamp.distance = 18;
    deskLamp.castShadow = true;
    const shadowRes = isMobile ? 512 : 1024;
    deskLamp.shadow.mapSize.width = shadowRes;
    deskLamp.shadow.mapSize.height = shadowRes;
    deskLamp.shadow.bias = -0.0005;
    scene.add(deskLamp);

    // Secondary subtle cool fill to define edges
    const rimLight = new THREE.DirectionalLight(0xdbe4f0, 0.45);
    rimLight.position.set(-3.5, -2.5, 3);
    scene.add(rimLight);

    // 5. Build Poster Group
    const posterGroup = new THREE.Group();
    posterGroup.rotation.z = 0.035; // subtle organic tilt
    scene.add(posterGroup);

    // Poster Dimensions
    const posterWidth = 3.2;
    const posterHeight = 4.4;

    // A. Main Cardboard Backing / Shadow caster
    const backingGeo = new THREE.BoxGeometry(posterWidth + 0.12, posterHeight + 0.12, 0.03);
    const backingMat = new THREE.MeshStandardMaterial({
      color: 0xd6cbb8,
      roughness: 0.95,
      metalness: 0.05,
    });
    const backingMesh = new THREE.Mesh(backingGeo, backingMat);
    backingMesh.position.z = -0.02;
    backingMesh.castShadow = true;
    backingMesh.receiveShadow = true;
    posterGroup.add(backingMesh);

    // B. Paper Mesh with subtle tactile corner curvature
    const paperSegments = 24;
    const paperGeo = new THREE.PlaneGeometry(posterWidth, posterHeight, paperSegments, paperSegments);
    const posAttr = paperGeo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      const y = posAttr.getY(i);
      // Slight dog-ear curl on bottom-right and top-left corners
      const distBR = Math.hypot(x - posterWidth / 2, y + posterHeight / 2);
      const distTL = Math.hypot(x + posterWidth / 2, y - posterHeight / 2);
      let zOffset = 0;
      if (distBR < 1.2) {
        zOffset += Math.pow((1.2 - distBR) / 1.2, 2) * 0.08;
      }
      if (distTL < 0.9) {
        zOffset += Math.pow((0.9 - distTL) / 0.9, 2) * 0.05;
      }
      posAttr.setZ(i, zOffset);
    }
    paperGeo.computeVertexNormals();

    // Create high-res 2D Canvas texture for Western Wanted poster
    const paperCanvas = document.createElement("canvas");
    paperCanvas.width = 1024;
    paperCanvas.height = 1440;
    const ctx = paperCanvas.getContext("2d")!;

    // 1. Aged Vintage Parchment Background
    const bgGrad = ctx.createLinearGradient(0, 0, 1024, 1440);
    bgGrad.addColorStop(0, "#f4eee0");
    bgGrad.addColorStop(0.5, "#ede5d2");
    bgGrad.addColorStop(1, "#e3d8be");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1024, 1440);

    // Distressed woodcut grain lines
    ctx.fillStyle = "rgba(22, 19, 14, 0.04)";
    for (let i = 0; i < 500; i++) {
      const rx = Math.random() * 1024;
      const ry = Math.random() * 1440;
      const rw = Math.random() * 50 + 8;
      ctx.fillRect(rx, ry, rw, 1.2);
    }

    // 2. Weathered Distressed Borders
    ctx.strokeStyle = "#16130e";
    ctx.lineWidth = 14;
    ctx.strokeRect(32, 32, 960, 1376);

    ctx.lineWidth = 3;
    ctx.strokeRect(48, 48, 928, 1344);

    // Corner decorative notches
    ctx.fillStyle = "#16130e";
    const cornerPts = [
      [32, 32],
      [960 + 32, 32],
      [32, 1376 + 32],
      [960 + 32, 1376 + 32],
    ];
    cornerPts.forEach(([cx, cy]) => {
      ctx.fillRect(cx - 8, cy - 8, 16, 16);
    });

    // 3. Header: WANTED (Classic Western Woodcut)
    ctx.fillStyle = "#16130e";
    ctx.font = "900 120px 'Outfit Variable', 'Impact', serif";
    ctx.textAlign = "center";
    ctx.letterSpacing = "14px";
    ctx.fillText("WANTED", 512, 175);

    // 4. Ribbon Banner: DEAD OR ALIVE
    const rw = 740;
    const rh = 54;
    const rx = (1024 - rw) / 2;
    const ry = 205;
    const notch = 22;

    ctx.fillStyle = "#16130e";
    ctx.beginPath();
    ctx.moveTo(rx, ry);
    ctx.lineTo(rx + rw, ry);
    ctx.lineTo(rx + rw - notch, ry + rh / 2);
    ctx.lineTo(rx + rw, ry + rh);
    ctx.lineTo(rx, ry + rh);
    ctx.lineTo(rx + notch, ry + rh / 2);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#ede5d2";
    ctx.font = "900 24px 'JetBrains Mono', monospace";
    ctx.textAlign = "center";
    ctx.letterSpacing = "8px";
    ctx.fillText("DEAD OR ALIVE", 512, ry + 36);

    // 5. Photo Frame Box
    const fw = 640;
    const fh = 680;
    const fx = (1024 - fw) / 2;
    const fy = 285;

    ctx.strokeStyle = "#16130e";
    ctx.lineWidth = 7;
    ctx.strokeRect(fx, fy, fw, fh);

    ctx.lineWidth = 2;
    ctx.strokeRect(fx + 8, fy + 8, fw - 16, fh - 16);

    ctx.fillStyle = "#dfd6c0";
    ctx.fillRect(fx + 10, fy + 10, fw - 20, fh - 20);

    // 6. Lower Ribbon: ARMED AND VERY DANGEROUS
    const bw = 800;
    const bh = 52;
    const bx = (1024 - bw) / 2;
    const by = 990;
    const bnotch = 22;

    ctx.fillStyle = "#16130e";
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(bx + bw, by);
    ctx.lineTo(bx + bw - bnotch, by + bh / 2);
    ctx.lineTo(bx + bw, by + bh);
    ctx.lineTo(bx, by + bh);
    ctx.lineTo(bx + bnotch, by + bh / 2);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#ede5d2";
    ctx.font = "900 22px 'JetBrains Mono', monospace";
    ctx.textAlign = "center";
    ctx.letterSpacing = "5px";
    ctx.fillText("ARMED AND VERY DANGEROUS", 512, by + 34);

    // 7. Reward Section (Western Cash Reward)
    ctx.textAlign = "left";
    ctx.fillStyle = "#16130e";
    ctx.font = "900 64px 'Outfit Variable', sans-serif";
    ctx.letterSpacing = "2px";
    ctx.fillText("CASH", 140, 1145);

    ctx.font = "bold 26px 'JetBrains Mono', monospace";
    ctx.letterSpacing = "4px";
    ctx.fillText("REWARD", 140, 1195);

    ctx.textAlign = "right";
    ctx.fillStyle = "#16130e";
    ctx.font = "900 88px 'Outfit Variable', monospace";
    ctx.letterSpacing = "4px";
    ctx.fillText(reward || "1.000.000 $", 884, 1182);

    // 8. Bottom Information Line
    ctx.strokeStyle = "rgba(22, 19, 14, 0.35)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(96, 1240);
    ctx.lineTo(928, 1240);
    ctx.stroke();

    ctx.textAlign = "center";
    ctx.fillStyle = "#514a3e";
    ctx.font = "bold 15px 'JetBrains Mono', monospace";
    ctx.letterSpacing = "2.5px";
    ctx.fillText(
      `ALX-017 · ${location.toUpperCase()} · DEPLOY FREQUENCY CRITICAL`,
      512,
      1280
    );

    const paperTexture = new THREE.CanvasTexture(paperCanvas);
    paperTexture.colorSpace = THREE.SRGBColorSpace;

    const paperMat = new THREE.MeshStandardMaterial({
      map: paperTexture,
      roughness: 0.88,
      metalness: 0.02,
    });
    const paperMesh = new THREE.Mesh(paperGeo, paperMat);
    paperMesh.castShadow = true;
    paperMesh.receiveShadow = true;
    posterGroup.add(paperMesh);

    // C. Photo Mesh (Positioned exactly inside the Western dark frame)
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(photoUrl, (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      const photoWidth = 1.92;
      const photoHeight = 2.02;
      const photoGeo = new THREE.PlaneGeometry(photoWidth, photoHeight);

      // Give photo semi-gloss luster (specular sheen)
      const photoMat = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.38,
        metalness: 0.12,
      });

      const photoMesh = new THREE.Mesh(photoGeo, photoMat);
      photoMesh.position.set(0, 0.29, 0.015);
      photoMesh.castShadow = true;
      posterGroup.add(photoMesh);
    });

    // D. Physical 3D Push Pin at Top
    const pinGroup = new THREE.Group();
    pinGroup.position.set(0, posterHeight / 2 - 0.12, 0.05);

    // Pin head (metallic / acrylic red)
    const pinHeadGeo = new THREE.CylinderGeometry(0.09, 0.07, 0.14, 16);
    const pinMat = new THREE.MeshStandardMaterial({
      color: 0xb3271e,
      roughness: 0.25,
      metalness: 0.45,
    });
    const pinHead = new THREE.Mesh(pinHeadGeo, pinMat);
    pinHead.rotation.x = Math.PI / 2;
    pinHead.castShadow = true;
    pinGroup.add(pinHead);

    // Pin center cap
    const capGeo = new THREE.SphereGeometry(0.08, 16, 16);
    const capMesh = new THREE.Mesh(capGeo, pinMat);
    capMesh.position.z = 0.08;
    pinGroup.add(capMesh);

    posterGroup.add(pinGroup);

    // 6. Interaction Physics (Mouse Parallax & Tilt)
    let targetRotX = 0;
    let targetRotY = 0;
    let targetPosZ = 0;
    let currentRotX = 0;
    let currentRotY = 0;
    let currentPosZ = 0;

    function onPointerMove(e: MouseEvent) {
      if (reduce) return;
      const rect = container!.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      // Natural tilt angles
      targetRotY = x * 0.32;
      targetRotX = -y * 0.24;
      targetPosZ = 0.2; // slight lift

      // Move desk light slightly with cursor for dynamic specular highlights
      deskLamp.position.x = 2.8 + x * 1.5;
      deskLamp.position.y = 4.5 + y * 1.5;
      renderer.shadowMap.needsUpdate = true;
    }

    function onPointerLeave() {
      targetRotX = 0;
      targetRotY = 0;
      targetPosZ = 0;
      deskLamp.position.x = 2.8;
      deskLamp.position.y = 4.5;
      renderer.shadowMap.needsUpdate = true;
    }

    container.addEventListener("mousemove", onPointerMove);
    container.addEventListener("mouseleave", onPointerLeave);

    // 7. Responsive Resize Observer
    const resizeObserver = new ResizeObserver(() => {
      if (!container || !renderer || !camera) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      if (width === 0 || height === 0) return;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      renderer.shadowMap.needsUpdate = true;
    });
    resizeObserver.observe(container);

    // 8. Visibility Observers to stop RAF when scrolled out or tab inactive
    let isTabActive = typeof document !== "undefined" ? !document.hidden : true;
    function onVisibilityChange() {
      isTabActive = !document.hidden;
      if (isTabActive) {
        lastTime = performance.now();
      }
    }
    document.addEventListener("visibilitychange", onVisibilityChange);

    const visibilityObserver = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
      if (isVisible) {
        renderer.shadowMap.needsUpdate = true;
      }
    });
    visibilityObserver.observe(container);

    // 9. Render Loop with Smooth Damping & Cinematic Entrance
    let lastTime = performance.now();
    const introStartTime = performance.now();
    const introDuration = 1000; // 1.0s entrance sequence
    let elapsedSeconds = 0;

    function animate(currentTime: number) {
      animationFrameId = requestAnimationFrame(animate);
      if (!isVisible || !isTabActive) return;

      const delta = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;
      elapsedSeconds += delta;

      if (!reduce) {
        // Entrance progress: 0 -> 1 with smooth ease-out
        const introP = Math.min((currentTime - introStartTime) / introDuration, 1);
        const easeIntro = 1 - Math.pow(1 - introP, 3);

        // Desk spotlight powers on & warms up
        deskLamp.intensity = 3.8 * easeIntro;

        // Camera smoothly dollies in: 7.7 -> 6.2
        camera.position.z = 6.2 + (1 - easeIntro) * 1.5;

        // Poster drops & docks onto desk table
        const introYOffset = (1 - easeIntro) * 0.9;
        const introRotX = (1 - easeIntro) * -0.22;

        // Subtle ambient floating breathing motion
        const floatZ = Math.sin(elapsedSeconds * 1.6) * 0.04 * easeIntro;
        const floatRotZ = 0.035 + Math.cos(elapsedSeconds * 1.2) * 0.015;

        // Smooth Lerp damping
        const lerpFactor = 1 - Math.exp(-9 * delta);
        currentRotX += (targetRotX - currentRotX) * lerpFactor;
        currentRotY += (targetRotY - currentRotY) * lerpFactor;
        currentPosZ += (targetPosZ + floatZ - currentPosZ) * lerpFactor;

        posterGroup.rotation.x = currentRotX + introRotX;
        posterGroup.rotation.y = currentRotY;
        posterGroup.rotation.z = floatRotZ;
        posterGroup.position.y = introYOffset;
        posterGroup.position.z = currentPosZ;
      } else {
        deskLamp.intensity = 3.8;
        camera.position.z = 6.2;
        posterGroup.rotation.set(0, 0, 0.035);
        posterGroup.position.set(0, 0, 0);
      }

      renderer.render(scene, camera);
    }

    animate(performance.now());

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener("mousemove", onPointerMove);
      container.removeEventListener("mouseleave", onPointerLeave);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();

      renderer.dispose();
      paperGeo.dispose();
      paperMat.dispose();
      paperTexture.dispose();
      backingGeo.dispose();
      backingMat.dispose();
      pinHeadGeo.dispose();
      capGeo.dispose();
      pinMat.dispose();
    };
  }, [photoUrl, name, code, reward, location, reduce, webGlSupported]);

  if (!webGlSupported) {
    // Elegant static fallback matching authentic Western Wanted poster
    return (
      <figure className="paper-raised card-dossier relative ml-auto max-w-sm rotate-2 bg-paper-card p-4 pb-5">
        <div className="border-4 border-ink p-3 text-center">
          <p className="font-display text-3xl font-extrabold tracking-[0.22em] text-ink uppercase">
            WANTED
          </p>
          <div className="my-1.5 bg-ink py-1 font-mono text-[10px] font-bold tracking-[0.24em] text-paper uppercase">
            DEAD OR ALIVE
          </div>
          <div className="border-2 border-ink p-1">
            <img
              src={photoUrl}
              alt={`Foto buronan ${name}`}
              className="aspect-[4/5] w-full object-cover object-top"
            />
          </div>
          <div className="my-1.5 bg-ink py-1 font-mono text-[10px] font-bold tracking-[0.16em] text-paper uppercase">
            ARMED AND VERY DANGEROUS
          </div>
          <div className="mt-2 flex items-baseline justify-between px-1">
            <div className="text-left font-mono">
              <span className="block text-xs font-black tracking-wider text-ink">CASH</span>
              <span className="block text-[9px] font-bold tracking-widest text-ink">REWARD</span>
            </div>
            <span className="font-display text-2xl font-black tracking-tight text-ink">
              {reward || " 3 Netherite Ingots"}
            </span>
          </div>
        </div>
      </figure>
    );
  }

  return (
    <div className="relative w-full max-w-md ml-auto">
      {/* 3D Canvas Stage */}
      <div
        ref={containerRef}
        className="relative h-[480px] w-full sm:h-[540px] md:h-[580px] cursor-grab active:cursor-grabbing select-none"
        style={{ perspective: "1200px" }}
      >
        <canvas ref={canvasRef} className="h-full w-full outline-none" />
      </div>
    </div>
  );
}
