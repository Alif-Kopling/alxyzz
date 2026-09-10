// @ts-nocheck
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, useAnimations } from "@react-three/drei";
import * as THREE from "three";

type Props = {
  progressRef?: React.MutableRefObject<number>;
  mouseRef?: React.MutableRefObject<{ x: number; y: number }>;
  reduced?: boolean;
};

const BASE_SCALE = 1.55;
const MODEL_Y = -1.8;

export function CharModel({ progressRef, mouseRef, reduced }: Props) {
  const group = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Object3D | null>(null);
  const chestRef = useRef<THREE.Object3D | null>(null);
  const hipsRef = useRef<THREE.Object3D | null>(null);
  const armRefs = useRef<{
    lShoulder: THREE.Object3D | null;
    rShoulder: THREE.Object3D | null;
    lArm: THREE.Object3D | null;
    rArm: THREE.Object3D | null;
    lElbow: THREE.Object3D | null;
    rElbow: THREE.Object3D | null;
    lWrist: THREE.Object3D | null;
    rWrist: THREE.Object3D | null;
    lArmTwist: THREE.Object3D | null;
    rArmTwist: THREE.Object3D | null;
    lHandTwist: THREE.Object3D | null;
    rHandTwist: THREE.Object3D | null;
  }>({ lShoulder: null, rShoulder: null, lArm: null, rArm: null, lElbow: null, rElbow: null, lWrist: null, rWrist: null, lArmTwist: null, rArmTwist: null, lHandTwist: null, rHandTwist: null });

  const gltf = useGLTF("/char.glb") as unknown as {
    scene: THREE.Group;
    animations: THREE.AnimationClip[];
  };
  const { animations } = gltf;
  const { actions } = useAnimations(animations, group);

  // log sekali buat verifikasi isi file
  useEffect(() => {
    const scene: THREE.Group = gltf.scene;
    let meshes = 0;
    let skins = 0;
    scene.traverse((o) => {
      // @ts-expect-error
      if (o.isMesh) meshes += 1;
      // @ts-expect-error
      if (o.isSkinnedMesh) skins += 1;
    });
    // eslint-disable-next-line no-console
    console.info(
      `[CharModel] char.glb nodes=${scene.children.length} meshes=${meshes} skins=${skins} animations=${animations.length}`,
    );
    if (animations.length) {
      animations.forEach((c) =>
        // eslint-disable-next-line no-console
        console.info(`  clip: ${c.name || "(unnamed)"} duration=${c.duration.toFixed(2)}`),
      );
    }
  }, [gltf.scene, animations]);

  // auto-play clip pertama kalau ada (T-pose patung biasanya tidak ada clip, aman)
  useEffect(() => {
    if (!animations.length) return;
    const first = animations[0];
    const act = actions[first.name];
    if (act) {
      act.reset().setEffectiveTimeScale(1).setLoop(THREE.LoopRepeat, Infinity).play();
    }
  }, [actions, animations]);

  // cari tulang kepala sekali saat mount
  const findHead = useMemo(() => {
    return () => {
      const scene = gltf.scene;
      let found: THREE.Object3D | null = null;
      const patterns = [/head/i, /kepala/i, /mixamorighead/i];
      scene.traverse((o) => {
        if (found) return;
        // @ts-expect-error bone check
        const isBone = o.isBone || o.type === "Bone";
        if (!isBone) return;
        if (patterns.some((re) => re.test(o.name))) found = o;
      });
      if (!found) {
        // fallback: neck
        scene.traverse((o) => {
          if (found) return;
          // @ts-expect-error
          const isBone = o.isBone || o.type === "Bone";
          if (!isBone) return;
          if (/neck/i.test(o.name)) found = o;
        });
      }
      return found;
    };
  }, [gltf.scene]);

  useEffect(() => {
    const h = findHead();
    headRef.current = h;
    // cari tulang lengan + badan
    const scene = gltf.scene;
    const byName = (re: RegExp) => {
      let f: THREE.Object3D | null = null;
      scene.traverse((o) => {
        if (f) return;
        // @ts-expect-error
        if (!(o.isBone || o.type === "Bone")) return;
        if (re.test(o.name)) f = o;
      });
      return f;
    };
    armRefs.current.lShoulder = byName(/^Left_shoulder_058$/i);
    armRefs.current.rShoulder = byName(/^Right_shoulder_084$/i);
    armRefs.current.lArm = byName(/^Left_arm_059$/i);
    armRefs.current.rArm = byName(/^Right_arm_085$/i);
    armRefs.current.lElbow = byName(/^Left_elbow_061$/i);
    armRefs.current.rElbow = byName(/^Right_elbow_087$/i);
    armRefs.current.lWrist = byName(/^Left_wrist_063$/i);
    armRefs.current.rWrist = byName(/^Right_wrist_089$/i);
    armRefs.current.lArmTwist = byName(/zArmTwist_L/i);
    armRefs.current.rArmTwist = byName(/zArmTwist_R/i);
    armRefs.current.lHandTwist = byName(/zHandTwist_L/i);
    armRefs.current.rHandTwist = byName(/zHandTwist_R/i);
    chestRef.current = byName(/Chest_04/i) ?? byName(/chest/i);
    hipsRef.current = byName(/Hips_02/i) ?? byName(/hips|pelvis/i);
    if (h) {
      if (!restQuats.has(h.name)) restQuats.set(h.name, h.quaternion.clone());
      headBase.current.set(h.name, restQuats.get(h.name)!.clone());
      // eslint-disable-next-line no-console
      console.info(`[CharModel] head bone: ${h.name}`);
    } else {
      // eslint-disable-next-line no-console
      console.info("[CharModel] head bone not found → putar seluruh model");
    }
    // eslint-disable-next-line no-console
    console.info("[CharModel] arms", {
      lShoulder: armRefs.current.lShoulder?.name,
      rShoulder: armRefs.current.rShoulder?.name,
      lArm: armRefs.current.lArm?.name,
      rArm: armRefs.current.rArm?.name,
      lElbow: armRefs.current.lElbow?.name,
      rElbow: armRefs.current.rElbow?.name,
      lArmTwist: armRefs.current.lArmTwist?.name,
      rArmTwist: armRefs.current.rArmTwist?.name,
      chest: chestRef.current?.name,
      hips: hipsRef.current?.name,
    });

    // ---- world-space pose solve: T-pose → A-pose rileks ----
    // Rotasi Euler lokal tidak bisa diandalkan (sumbu bone hasil konversi FBX tidak
    // terdokumentasi — offset sebelumnya jatuh di sumbu twist sehingga siluet tetap T-pose).
    // Jadi arah lengan diukur di world, diputar ke arah target, lalu dikonversi ke quat lokal.
    // PENTING: rest-pose di-snapshot sekali di module-level. useGLTF meng-cache scene,
    // StrictMode + HMR bikin effect jalan 2x di atas skeleton yang sama — tanpa reset,
    // run kedua mengukur base dari hasil pose pertama (base = posed) sehingga hasilnya
    // ngaco / kurang turun. Reset dulu → idempotent.
    const regs = armRefs.current;
    const poseBones = [
      regs.lShoulder, regs.rShoulder, regs.lArm, regs.rArm,
      regs.lElbow, regs.rElbow, regs.lWrist, regs.rWrist,
      regs.lArmTwist, regs.rArmTwist, regs.lHandTwist, regs.rHandTwist,
      chestRef.current, hipsRef.current,
    ];
    for (const b of poseBones) {
      if (!b) continue;
      if (!restQuats.has(b.name)) restQuats.set(b.name, b.quaternion.clone());
      b.quaternion.copy(restQuats.get(b.name)!);
      baseQuats.current.set(b.name, restQuats.get(b.name)!.clone());
    }
    scene.updateMatrixWorld(true);

    try {
      const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z).normalize();
      const dirOf = (a: THREE.Object3D, b: THREE.Object3D) => {
        a.updateWorldMatrix(true, false);
        b.updateWorldMatrix(true, false);
        const pa = new THREE.Vector3().setFromMatrixPosition(a.matrixWorld);
        const pb = new THREE.Vector3().setFromMatrixPosition(b.matrixWorld);
        return pb.sub(pa).normalize();
      };
      const solveAim = (bone: THREE.Object3D, curDir: THREE.Vector3, targetDir: THREE.Vector3) => {
        const qW = new THREE.Quaternion().setFromUnitVectors(curDir, targetDir);
        const qp = new THREE.Quaternion();
        if (bone.parent) bone.parent.getWorldQuaternion(qp);
        // local delta = parentWorld⁻¹ * worldRot * parentWorld, target = delta * base(rest)
        const rest = restQuats.get(bone.name) ?? bone.quaternion.clone();
        return qp
          .clone()
          .invert()
          .multiply(qW)
          .multiply(qp)
          .multiply(rest.clone());
      };
      // karakter menghadap +Z (kamera di +Z): depan = +Z
      const UP_L = V(0.18, -1, 0.18); // lengan atas: hampir vertikal ke bawah + sedikit keluar & depan
      const UP_R = V(-0.18, -1, 0.18);
      const FORE_L = V(0.12, -0.7, 0.7); // lengan bawah: bawah-depan (siku nekuk ~50-60°)
      const FORE_R = V(-0.12, -0.7, 0.7);

      // Hierarki asli: Chest -> shoulder(clavicle) -> arm(upper arm) -> elbow -> wrist.
      // URUTAN MENENTUKAN: parent dulu baru child, karena aim child diukur dalam parent-frame terbaru.
      // 1) clavicle: parsial 30% dari full-aim (bahu natural, tidak kaku)
      const solvePartial = (bone: THREE.Object3D | null, end: THREE.Object3D | null, target: THREE.Vector3, amount: number) => {
        if (!bone || !end) return;
        const full = solveAim(bone, dirOf(bone, end), target);
        const rest = restQuats.get(bone.name) ?? bone.quaternion.clone();
        const tgt = rest.clone().slerp(full, amount);
        poseTargets.current.set(bone.name, tgt);
        bone.quaternion.copy(tgt);
        bone.updateWorldMatrix(true, false);
      };
      const solveFull = (bone: THREE.Object3D | null, end: THREE.Object3D | null, target: THREE.Vector3) => {
        if (!bone || !end) return;
        const tgt = solveAim(bone, dirOf(bone, end), target);
        poseTargets.current.set(bone.name, tgt);
        bone.quaternion.copy(tgt);
        bone.updateWorldMatrix(true, false);
      };
      if (regs.lShoulder && regs.lElbow) solvePartial(regs.lShoulder, regs.lElbow, UP_L, 0.3);
      if (regs.rShoulder && regs.rElbow) solvePartial(regs.rShoulder, regs.rElbow, UP_R, 0.3);
      // 2) upper arm: FULL aim, dihitung SETELAH clavicle final (parent-frame sudah benar)
      if (regs.lArm && regs.lElbow) solveFull(regs.lArm, regs.lElbow, UP_L);
      if (regs.rArm && regs.rElbow) solveFull(regs.rArm, regs.rElbow, UP_R);
      // 3) siku dihitung SETELAH upper-arm final (parent frame sudah benar)
      if (regs.lElbow && regs.lWrist) solveFull(regs.lElbow, regs.lWrist, FORE_L);
      if (regs.rElbow && regs.rWrist) solveFull(regs.rElbow, regs.rWrist, FORE_R);
      // 4) wrist: pronasi ringan ke dalam biar telapak natural (+ sedikit tekuk), dari rest
      const wristPose = (w: THREE.Object3D | null, mirror: 1 | -1) => {
        if (!w) return;
        const rest = restQuats.get(w.name) ?? w.quaternion.clone();
        const q = rest.clone()
          .multiply(_qTmp.setFromAxisAngle(_Y_AXIS, 0.26 * mirror))
          .multiply(_qTmp2.setFromAxisAngle(_X_AXIS, 0.12));
        poseTargets.current.set(w.name, q);
        w.quaternion.copy(q);
      };
      wristPose(regs.lWrist, -1);
      wristPose(regs.rWrist, 1);
      // 5) twist compensation: twist bones ikut 50% delta arm/elbow (dari rest)
      // biar mesh tidak ketarik balik ke T-pose / terpelintir
      const followDelta = (
        sourceName: string | undefined,
        twist: THREE.Object3D | null,
        amount = 0.5,
      ) => {
        if (!sourceName || !twist) return;
        const base = baseQuats.current.get(sourceName);
        const tgt = poseTargets.current.get(sourceName);
        if (!base || !tgt) return;
        const rest = restQuats.get(twist.name) ?? twist.quaternion.clone();
        const delta = base.clone().invert().multiply(tgt);
        const partial = new THREE.Quaternion().slerp(delta, amount);
        const tq = rest.clone().multiply(partial);
        poseTargets.current.set(twist.name, tq);
        twist.quaternion.copy(tq);
      };
      followDelta(regs.lArm?.name, regs.lArmTwist, 0.5);
      followDelta(regs.rArm?.name, regs.rArmTwist, 0.5);
      followDelta(regs.lElbow?.name, regs.lHandTwist, 0.5);
      followDelta(regs.rElbow?.name, regs.rHandTwist, 0.5);
      // eslint-disable-next-line no-console
      console.info("[CharModel] pose solved (world-space): shoulders down, elbows bent, wrists + twist");
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn("[CharModel] pose solve gagal, pakai T-pose asli", err);
    }
    return () => {
      // cleanup HMR/unmount: kembalikan ke rest biar run berikutnya idempotent
      for (const b of poseBones) {
        if (!b) continue;
        const rest = restQuats.get(b.name);
        if (rest) b.quaternion.copy(rest);
      }
    };
  }, [findHead, gltf.scene]);

  // animated values (damped) + blend-in pose
  const yawRef = useRef(0);
  const pitchRef = useRef(0);
  const poseT = useRef(0);

  // world-space solved pose: base quat + target quat per bone
  const baseQuats = useRef(new Map<string, THREE.Quaternion>());
  const poseTargets = useRef(new Map<string, THREE.Quaternion>());
  const headBase = useRef(new Map<string, THREE.Quaternion>());

  useFrame(({ clock }, delta) => {
    if (!group.current) return;
    const t = clock.elapsedTime;

    // reduced-motion: langsung pose final, statis
    if (reduced) {
      poseT.current = 1;
      const posedStatic = [
        armRefs.current.lShoulder, armRefs.current.rShoulder,
        armRefs.current.lArm, armRefs.current.rArm,
        armRefs.current.lElbow, armRefs.current.rElbow,
        armRefs.current.lWrist, armRefs.current.rWrist,
        armRefs.current.lArmTwist, armRefs.current.rArmTwist,
        armRefs.current.lHandTwist, armRefs.current.rHandTwist,
      ];
      for (const b of posedStatic) {
        if (!b) continue;
        const tgt = poseTargets.current.get(b.name);
        if (tgt) b.quaternion.copy(tgt);
      }
      group.current.position.y = MODEL_Y;
      group.current.scale.set(BASE_SCALE, BASE_SCALE, BASE_SCALE);
      group.current.rotation.set(0, 0, 0);
      return;
    }

    // blend-in pose 0→1 selama ~1.1s biar tidak snap
    poseT.current = Math.min(poseT.current + delta * 0.85, 1);
    const ease = 1 - Math.pow(1 - poseT.current, 3); // easeOut

    // kaki napak: group dikunci, tidak ada idleY / scale breathing / sway badan
    // (sebelumnya seluruh tubuh naik-turun → kelihatan ngambang)
    group.current.position.y = MODEL_Y;
    group.current.scale.set(BASE_SCALE, BASE_SCALE, BASE_SCALE);
    const idleRotZ = 0; // kepala roll dimatikan biar tidak goyang

    // ---- lengan: blend base(T-pose) → target(world-space solved) + micro sway ----
    // slerp tiap frame dari base (reset dulu) → tidak ada akumulasi drift
    const posed = [
      armRefs.current.lShoulder, armRefs.current.rShoulder,
      armRefs.current.lArm, armRefs.current.rArm,
      armRefs.current.lElbow, armRefs.current.rElbow,
      armRefs.current.lWrist, armRefs.current.rWrist,
      armRefs.current.lArmTwist, armRefs.current.rArmTwist,
      armRefs.current.lHandTwist, armRefs.current.rHandTwist,
    ];
    for (const b of posed) {
      if (!b) continue;
      const base = baseQuats.current.get(b.name);
      const tgt = poseTargets.current.get(b.name);
      if (base && tgt) b.quaternion.copy(base).slerp(tgt, ease);
    }
    // micro life HANYA di siku + wrist (bahu/lengan atas dikunci biar siluet A-pose stabil)
    const microElbow = 0.05 * ease;
    if (armRefs.current.lElbow)
      armRefs.current.lElbow.quaternion.multiply(_qTmp.setFromAxisAngle(_X_AXIS, Math.sin(t * 0.8) * microElbow));
    if (armRefs.current.rElbow)
      armRefs.current.rElbow.quaternion.multiply(_qTmp.setFromAxisAngle(_X_AXIS, Math.sin(t * 0.84 + 0.6) * microElbow));
    // wrist sway halus biar jari/tangan tidak mati
    if (armRefs.current.lWrist)
      armRefs.current.lWrist.quaternion.multiply(_qTmp.setFromAxisAngle(_Z_AXIS, Math.sin(t * 0.7 + 0.3) * 0.02 * ease));
    if (armRefs.current.rWrist)
      armRefs.current.rWrist.quaternion.multiply(_qTmp.setFromAxisAngle(_Z_AXIS, Math.sin(t * 0.74) * 0.02 * ease));

    // ---- badan dikunci: chest/hips balik ke base (tidak ada napas/sway) ----
    // chest breathing sebelumnya ikut gerakin bahu+lengan+kepala (child of chest) → seluruh tubuh goyang
    if (chestRef.current) {
      const base = baseQuats.current.get(chestRef.current.name);
      if (base) chestRef.current.quaternion.copy(base);
    }
    if (hipsRef.current) {
      const base = baseQuats.current.get(hipsRef.current.name);
      if (base) hipsRef.current.quaternion.copy(base);
    }

    // scroll yaw: kartu bergerak ke kiri → tatapan ngikut ke kiri (progress 0→1)
    const p = progressRef?.current ?? 0;
    const scrollYaw = (p - 0.5) * 0.7; // -0.35 .. +0.35

    // mouse yaw/pitch: mouseRef x/y di -1..1, clamp ±0.4 rad
    const mx = mouseRef?.current.x ?? 0;
    const my = mouseRef?.current.y ?? 0;
    const targetYaw = scrollYaw * 0.65 + mx * 0.42;
    const targetPitch = my * -0.22;

    // damp
    const lerp = 1 - Math.pow(0.01, delta * 60); // framerate-independent
    yawRef.current = THREE.MathUtils.lerp(yawRef.current, targetYaw, lerp * 0.08 + 0.02);
    pitchRef.current = THREE.MathUtils.lerp(pitchRef.current, targetPitch, lerp * 0.08 + 0.02);

    const head = headRef.current;
    if (head) {
      // additive di atas rest-pose: jangan overwrite Euler (rest Head_06 tidak nol → snap)
      // bob dibuat kecil, hanya kepala yang gerak (badan dikunci)
      const base = headBase.current.get(head.name);
      const bob = Math.sin(t * 0.5) * 0.02 * ease;
      _qYaw.setFromAxisAngle(_Y_AXIS, yawRef.current);
      _qPitch.setFromAxisAngle(_X_AXIS, pitchRef.current + bob);
      _qRoll.setFromAxisAngle(_Z_AXIS, idleRotZ * 0.6);
      if (base) head.quaternion.copy(base).multiply(_qYaw).multiply(_qPitch).multiply(_qRoll);
      else head.quaternion.identity().multiply(_qYaw).multiply(_qPitch).multiply(_qRoll);
    } else {
      group.current.rotation.y = yawRef.current;
      group.current.rotation.x = pitchRef.current * 0.5;
      group.current.rotation.z = idleRotZ;
    }
  });

  // skala & posisi: patung di tengah belakang, kaki di bawah horizon
  return (
    <group ref={group} position={[0, MODEL_Y, 0]} scale={BASE_SCALE}>
      <primitive object={gltf.scene} />
    </group>
  );
}

// rest-pose snapshot module-level: useGLTF cache + StrictMode/HMR bikin effect 2x,
// tanpa ini run kedua mengira pose-pertama = rest → hasil kurang turun / drift.
const restQuats = new Map<string, THREE.Quaternion>();

// tmp objects module-scope (hindari alokasi per-frame)
const _qTmp = new THREE.Quaternion();
const _qTmp2 = new THREE.Quaternion();
const _qYaw = new THREE.Quaternion();
const _qPitch = new THREE.Quaternion();
const _qRoll = new THREE.Quaternion();
const _X_AXIS = new THREE.Vector3(1, 0, 0);
const _Y_AXIS = new THREE.Vector3(0, 1, 0);
const _Z_AXIS = new THREE.Vector3(0, 0, 1);

useGLTF.preload("/char.glb");
