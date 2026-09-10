// @ts-nocheck
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, useAnimations } from "@react-three/drei";
import * as THREE from "three";
import { livePose } from "./charPose";
import { attentionRef } from "../lib/attention";
import { angerRef, headTrack } from "../lib/anger";

type Props = {
  progressRef?: React.MutableRefObject<number>;
  mouseRef?: React.MutableRefObject<{ x: number; y: number }>;
  reduced?: boolean;
};

const BASE_SCALE = 1.32;
const MODEL_Y = -1.55;
// Tengah: char pas di center (permintaan user), tetap 3/4 view
const GROUP_X = 0;
const SIT_YAW = -0.42;

export function CharModel({ progressRef, mouseRef, reduced }: Props) {
  const group = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Object3D | null>(null);
  const chestRef = useRef<THREE.Object3D | null>(null);
  const hipsRef = useRef<THREE.Object3D | null>(null);
  const legRefs = useRef({
    leftThigh: null as THREE.Object3D | null,
    rightThigh: null as THREE.Object3D | null,
    leftKnee: null as THREE.Object3D | null,
    rightKnee: null as THREE.Object3D | null,
    leftAnkle: null as THREE.Object3D | null,
    rightAnkle: null as THREE.Object3D | null,
  });
  const faceRefs = useRef({
    leftEye: null as THREE.Object3D | null,
    rightEye: null as THREE.Object3D | null,
    mouth: null as THREE.Object3D | null,
  });
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
  // jari: 3 ruas x 5 jari x 2 tangan (Thumb0_L_064 ... LittleFinger3_R_0104)
  const fingerRefs = useRef({
    L: { thumb: [], index: [], middle: [], ring: [], little: [] },
    R: { thumb: [], index: [], middle: [], ring: [], little: [] },
  } as Record<"L" | "R", Record<string, THREE.Object3D[]>>);

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
    legRefs.current.leftThigh = byName(/leg_0120$/i);
    legRefs.current.rightThigh = byName(/leg_0124$/i);
    legRefs.current.leftKnee = byName(/knee_0121$/i);
    legRefs.current.rightKnee = byName(/knee_0125$/i);
    legRefs.current.leftAnkle = byName(/ankle_0122$/i);
    legRefs.current.rightAnkle = byName(/ankle_0126$/i);
    faceRefs.current.leftEye = byName(/^Eye_L_08$/i);
    faceRefs.current.rightEye = byName(/^Eye_R_07$/i);
    faceRefs.current.mouth = byName(/_011$/i);
    for (const eye of [faceRefs.current.leftEye, faceRefs.current.rightEye]) {
      if (eye && !restScales.has(eye.name)) restScales.set(eye.name, eye.scale.clone());
    }
    if (faceRefs.current.mouth && !restQuats.has(faceRefs.current.mouth.name)) {
      restQuats.set(faceRefs.current.mouth.name, faceRefs.current.mouth.quaternion.clone());
    }
    // kumpulin tulang jari + snapshot rest (selalu dari rest biar idempotent)
    {
      const F = fingerRefs.current;
      const re = /^(Thumb[012]|IndexFinger[123]|MiddleFinger[123]|RingFinger[123]|LittleFinger[123])_([LR])_/;
      const baseOf = (b: string) =>
        b.startsWith("Thumb") ? "thumb" : b.startsWith("Index") ? "index" : b.startsWith("Middle") ? "middle" : b.startsWith("Ring") ? "ring" : "little";
      let nL = 0;
      let nR = 0;
      scene.traverse((o) => {
        const m = re.exec(o.name);
        if (!m) return;
        const isBone = o.isBone || o.type === "Bone";
        if (!isBone) return;
        const bone = o as THREE.Object3D;
        const segDigits = m[1].replace(/\D/g, "");
        const seg = Number(segDigits);
        const idx = m[1].startsWith("Thumb") ? seg : seg - 1;
        F[m[2] as "L" | "R"][baseOf(m[1])][idx] = bone;
        if (!restQuats.has(bone.name)) restQuats.set(bone.name, bone.quaternion.clone());
        if (m[2] === "L") nL += 1;
        else nR += 1;
      });
      // eslint-disable-next-line no-console
      console.info(`[CharModel] fingers L=${nL} R=${nR}`);
    }
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
      legRefs.current.leftThigh, legRefs.current.rightThigh,
      legRefs.current.leftKnee, legRefs.current.rightKnee,
      legRefs.current.leftAnkle, legRefs.current.rightAnkle,
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
      // Duduk elegan: lengan jatuh ke samping-bawah (ke armrest/paha), bukan ke depan
      const UP_L = V(0.42, -1, 0.1); // lengan atas: turun + buka ke samping
      const UP_R = V(-0.42, -1, 0.1);
      const FORE_L = V(0.18, -0.85, 0.35); // lengan bawah: turun, sedikit depan, jatuh di paha
      const FORE_R = V(-0.18, -0.85, 0.35);

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

      // === KAKI DUDUK: pakai world-space aim (bukan tebak sumbu lokal) ===
      // Sumbu lokal bone FBX tidak terdokumentasi — tebakan X/Y sebelumnya
      // bikin kaki maju paralel, bukan nyilang. Solusi: ukur arah di world,
      // putar ke target, konversi ke quat lokal (sama kayak lengan).
      // Target: kedua paha ke SATU sisi (kanan layar, +X) biar feminin,
      // kanan = atas menumpuk di atas kiri.
      const THIGH_BOTTOM = V(0.32, -0.1, 1); // kiri bawah: depan-kanan, lutut sedikit di bawah pinggul
      const THIGH_TOP = V(0.48, 0.08, 0.88); // kanan atas: lebih ke kanan + sedikit naik (numpuk)
      const SHIN_BOTTOM = V(0.12, -1, 0.3); // betis bawah: vertikal, sedikit depan
      const SHIN_TOP = V(-0.24, -1, 0.42); // betis atas: nyilang balik ke kiri + depan (ngunci silangan)

      // Torso dulu (parent dari paha) biar frame parent sudah final saat solve kaki
      if (chestRef.current) {
        const base = restQuats.get(chestRef.current.name);
        if (base) {
          const q = base.clone().multiply(_qChestSit);
          poseTargets.current.set(chestRef.current.name, q);
          chestRef.current.quaternion.copy(q);
        }
      }
      if (hipsRef.current) {
        const base = restQuats.get(hipsRef.current.name);
        if (base) {
          const q = base.clone().multiply(_qHipsSit);
          poseTargets.current.set(hipsRef.current.name, q);
          hipsRef.current.quaternion.copy(q);
        }
      }
      scene.updateMatrixWorld(true);

      // Paha: FULL aim setelah torso final
      const L = legRefs.current;
      if (L.leftThigh && L.leftKnee) solveFull(L.leftThigh, L.leftKnee, THIGH_BOTTOM);
      if (L.rightThigh && L.rightKnee) solveFull(L.rightThigh, L.rightKnee, THIGH_TOP);
      // Lutut: dihitung SETELAH paha final
      if (L.leftKnee && L.leftAnkle) solveFull(L.leftKnee, L.leftAnkle, SHIN_BOTTOM);
      if (L.rightKnee && L.rightAnkle) solveFull(L.rightKnee, L.rightAnkle, SHIN_TOP);
      // Ankle: tekuk lokal biar telapak rata (tidak perlu world aim)
      for (const a of [L.leftAnkle, L.rightAnkle]) {
        if (!a) continue;
        const rest = restQuats.get(a.name) ?? a.quaternion.clone();
        const q = rest.clone().multiply(_qSitAnkle);
        poseTargets.current.set(a.name, q);
        a.quaternion.copy(q);
      }
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

  // smoothing buat panel kontrol live (biar gerakan halus, tidak snap)
  const smoothAdd = useRef<Record<string, { x: number; y: number; z: number }>>({});
  const groupSm = useRef({ x: GROUP_X, y: MODEL_Y, yaw: SIT_YAW, scale: BASE_SCALE });
  const faceSm = useRef({ ex: 0, ey: 0, blink: 0, smile: 1 });
  // perhatian ke kartu yang di-hover (nengok + angguk, di-smoothing)
  const attSm = useRef({ s: 0, dx: 0 });

  const sm3 = (key: string, t: { x: number; y: number; z: number }, k: number) => {
    const S = smoothAdd.current;
    let s = S[key];
    if (!s) {
      s = S[key] = { x: t.x, y: t.y, z: t.z };
      return s;
    }
    s.x += (t.x - s.x) * k;
    s.y += (t.y - s.y) * k;
    s.z += (t.z - s.z) * k;
    return s;
  };

  const addE = (b: THREE.Object3D | null, s: { x: number; y: number; z: number }) => {
    if (!b) return;
    if (s.x === 0 && s.y === 0 && s.z === 0) return;
    _euler.set(s.x, s.y, s.z);
    b.quaternion.multiply(_qAdd.setFromEuler(_euler));
  };

  // smoothing skalar buat panel jari
  const smoothNum = useRef<Record<string, number>>({});
  const sm1 = (key: string, target: number, k: number) => {
    const S = smoothNum.current;
    const cur = S[key] ?? target;
    const nx = cur + (target - cur) * k;
    S[key] = nx;
    return nx;
  };

  // curl per ruas (tebakan sumbu X; slider boleh negatif buat balikin arah),
  // spread kipas antar jari (cuma ruas pangkal). Selalu dari rest → idempotent.
  // Faktor digedein biar kepalan bisa nutup penuh, bukan setengah jalan.
  const FINGER_CURL = [0.7, 1.0, 1.2];
  const THUMB_CURL = [0.5, 0.8, 1.0];
  const SPREAD_FAN: Record<string, number> = { thumb: 0.4, index: 0.3, middle: 0, ring: -0.3, little: -0.55 };

  const applyFingers = (
    side: "L" | "R",
    H: { thumb: number; index: number; middle: number; ring: number; little: number; spread: number },
    k: number | null,
  ) => {
    const F = fingerRefs.current[side];
    const spread = k === null ? H.spread : sm1(`spread${side}`, H.spread, k);
    for (const fname of ["thumb", "index", "middle", "ring", "little"] as const) {
      const bones = F[fname];
      if (!bones) continue;
      const curlTarget = H[fname];
      const curl = k === null ? curlTarget : sm1(`curl${side}${fname}`, curlTarget, k);
      if (curl === 0 && spread === 0) continue;
      bones.forEach((b, i) => {
        if (!b) return;
        const rest = restQuats.get(b.name);
        if (!rest) return;
        const f = fname === "thumb" ? (THUMB_CURL[i] ?? 0.5) : (FINGER_CURL[i] ?? 0.7);
        _euler.set(curl * f, 0, 0);
        const q = _qAdd.setFromEuler(_euler).clone();
        if (i === 0 && spread !== 0) {
          q.multiply(_qTmp.setFromAxisAngle(_Y_AXIS, spread * (SPREAD_FAN[fname] ?? 0)));
        }
        b.quaternion.copy(rest).multiply(q);
      });
    }
  };

  // pasangan [bone, target-additive-dari-panel] — pose solved tetap jadi basis
  const additivePairs = () => {
    const P = livePose.current;
    return [
      [chestRef.current, P.chest],
      [hipsRef.current, P.hips],
      [armRefs.current.lArm, P.upperArmL],
      [armRefs.current.lElbow, P.elbowL],
      [armRefs.current.lWrist, P.wristL],
      [armRefs.current.rArm, P.upperArmR],
      [armRefs.current.rElbow, P.elbowR],
      [armRefs.current.rWrist, P.wristR],
      [legRefs.current.leftThigh, P.thighL],
      [legRefs.current.leftKnee, P.kneeL],
      [legRefs.current.leftAnkle, P.ankleL],
      [legRefs.current.rightThigh, P.thighR],
      [legRefs.current.rightKnee, P.kneeR],
      [legRefs.current.rightAnkle, P.ankleR],
    ] as Array<[THREE.Object3D | null, { x: number; y: number; z: number }]>;
  };

  useFrame(({ clock, camera }, delta) => {
    if (!group.current) return;
    const t = clock.elapsedTime;

    // reduced-motion: langsung pose final, statis (+ additive panel mentah)
    if (reduced) {
      poseT.current = 1;
      const P0 = livePose.current;
      // amarah klik-kepala versi statis (tanpa geleng, biar tidak goyang)
      const at0 = performance.now() / 1000 - angerRef.start;
      let pout0 = 0, frown0 = 0;
      if (at0 >= 0 && at0 < 1.4) {
        const env0 = Math.sin((at0 / 1.4) * Math.PI);
        pout0 = 0.12 * env0;
        frown0 = env0;
      }
      const posedStatic = [
        armRefs.current.lShoulder, armRefs.current.rShoulder,
        armRefs.current.lArm, armRefs.current.rArm,
        armRefs.current.lElbow, armRefs.current.rElbow,
        armRefs.current.lWrist, armRefs.current.rWrist,
        armRefs.current.lArmTwist, armRefs.current.rArmTwist,
        armRefs.current.lHandTwist, armRefs.current.rHandTwist,
        legRefs.current.leftThigh, legRefs.current.rightThigh,
        legRefs.current.leftKnee, legRefs.current.rightKnee,
        legRefs.current.leftAnkle, legRefs.current.rightAnkle,
        chestRef.current, hipsRef.current,
      ];
      for (const b of posedStatic) {
        if (!b) continue;
        const tgt = poseTargets.current.get(b.name);
        if (tgt) b.quaternion.copy(tgt);
      }
      for (const [b, t] of additivePairs()) {
        if (!b) continue;
        if (t.x === 0 && t.y === 0 && t.z === 0) continue;
        _euler.set(t.x, t.y, t.z);
        b.quaternion.multiply(_qAdd.setFromEuler(_euler));
      }
      const head0 = headRef.current;
      if (head0) {
        const base0 = headBase.current.get(head0.name);
        _euler.set(P0.head.x + pout0, P0.head.y, P0.head.z);
        const qh = _qAdd.setFromEuler(_euler).clone();
        if (base0) head0.quaternion.copy(base0).multiply(qh);
        else head0.quaternion.copy(qh);
        // hover kartu: nengok mentah (tanpa smoothing) ke arah kartu
        const att0 = attentionRef.current;
        if (att0.active) {
          _euler.set(0.16, att0.dx * 0.25, 0);
          head0.quaternion.multiply(_qAdd.setFromEuler(_euler));
        }
        head0.getWorldPosition(_vHead);
        headTrack.x = _vHead.x;
        headTrack.y = _vHead.y;
        headTrack.z = _vHead.z;
        headTrack.cam = camera;
        headTrack.valid = true;
      } else {
        headTrack.valid = false;
      }
      const F0 = P0.face ?? { eyeX: 0, eyeY: 0, blink: 0, smile: 1, auto: true };
      _qEyeYaw.setFromAxisAngle(_Y_AXIS, (F0.eyeY || 0) * 0.45);
      _qEyePitch.setFromAxisAngle(_X_AXIS, (F0.eyeX || 0) * 0.35);
      for (const eye of [faceRefs.current.leftEye, faceRefs.current.rightEye]) {
        if (!eye) continue;
        const base = restQuats.get(eye.name);
        const baseScale = restScales.get(eye.name);
        if (base) eye.quaternion.copy(base).multiply(_qEyeYaw).multiply(_qEyePitch);
        if (baseScale) eye.scale.set(baseScale.x, baseScale.y * (1 - Math.min(1, F0.blink || 0) * 0.85), baseScale.z);
      }
      const mouthBase = faceRefs.current.mouth && restQuats.get(faceRefs.current.mouth.name);
      if (faceRefs.current.mouth && mouthBase) {
        _qSmileDyn.setFromAxisAngle(_Z_AXIS, -0.12 * (F0.smile ?? 1));
        faceRefs.current.mouth.quaternion.copy(mouthBase).multiply(_qSmileDyn);
        if (frown0 > 0) {
          faceRefs.current.mouth.quaternion.multiply(_qTmp.setFromAxisAngle(_Z_AXIS, 0.3 * frown0));
        }
      }
      applyFingers("L", P0.handL ?? { thumb: 0, index: 0, middle: 0, ring: 0, little: 0, spread: 0 }, null);
      applyFingers("R", P0.handR ?? { thumb: 0, index: 0, middle: 0, ring: 0, little: 0, spread: 0 }, null);
      group.current.position.set(P0.group.x, P0.group.y, 0);
      group.current.scale.set(P0.group.scale, P0.group.scale, P0.group.scale);
      group.current.rotation.set(0, P0.group.yaw, 0);
      return;
    }

    // blend-in pose 0→1 selama ~1.1s biar tidak snap
    poseT.current = Math.min(poseT.current + delta * 0.85, 1);
    const ease = 1 - Math.pow(1 - poseT.current, 3); // easeOut

    // grup ngikut panel (di-smoothing biar halus, tidak snap)
    const P = livePose.current;
    const kk = 1 - Math.exp(-(P.smooth || 8) * delta);
    const G = groupSm.current;
    G.x += (P.group.x - G.x) * kk;
    G.y += (P.group.y - G.y) * kk;
    G.yaw += (P.group.yaw - G.yaw) * kk;
    G.scale += (P.group.scale - G.scale) * kk;
    group.current.position.set(G.x, G.y, 0);
    group.current.scale.set(G.scale, G.scale, G.scale);
    const idleRotZ = 0; // kepala roll dimatikan biar tidak goyang

    // ---- lengan + kaki + torso: blend base(T-pose) → target(world-space solved) + micro sway ----
    // slerp tiap frame dari base (reset dulu) → tidak ada akumulasi drift
    const posed = [
      armRefs.current.lShoulder, armRefs.current.rShoulder,
      armRefs.current.lArm, armRefs.current.rArm,
      armRefs.current.lElbow, armRefs.current.rElbow,
      armRefs.current.lWrist, armRefs.current.rWrist,
      armRefs.current.lArmTwist, armRefs.current.rArmTwist,
      armRefs.current.lHandTwist, armRefs.current.rHandTwist,
      legRefs.current.leftThigh, legRefs.current.rightThigh,
      legRefs.current.leftKnee, legRefs.current.rightKnee,
      legRefs.current.leftAnkle, legRefs.current.rightAnkle,
      chestRef.current, hipsRef.current,
    ];
    for (const b of posed) {
      if (!b) continue;
      const base = baseQuats.current.get(b.name);
      const tgt = poseTargets.current.get(b.name);
      if (base && tgt) b.quaternion.copy(base).slerp(tgt, ease);
    }
    // micro life HANYA di siku + wrist (bahu/lengan atas dikunci biar siluet A-pose stabil)
    const microAmt = P.micro ?? 1;
    const microElbow = 0.05 * ease * microAmt;
    if (armRefs.current.lElbow)
      armRefs.current.lElbow.quaternion.multiply(_qTmp.setFromAxisAngle(_X_AXIS, Math.sin(t * 0.8) * microElbow));
    if (armRefs.current.rElbow)
      armRefs.current.rElbow.quaternion.multiply(_qTmp.setFromAxisAngle(_X_AXIS, Math.sin(t * 0.84 + 0.6) * microElbow));
    // wrist sway halus biar jari/tangan tidak mati
    if (armRefs.current.lWrist)
      armRefs.current.lWrist.quaternion.multiply(_qTmp.setFromAxisAngle(_Z_AXIS, Math.sin(t * 0.7 + 0.3) * 0.02 * ease * microAmt));
    if (armRefs.current.rWrist)
      armRefs.current.rWrist.quaternion.multiply(_qTmp.setFromAxisAngle(_Z_AXIS, Math.sin(t * 0.74) * 0.02 * ease * microAmt));

    // ---- panel kontrol live: additive halus di atas pose solved ----
    for (const [b, t] of additivePairs()) {
      if (!b) continue;
      addE(b, sm3(b.name, t, kk));
    }

    // ---- torso ikut pose duduk (jangan di-reset ke base, biar twist elegan ke-keep) ----
    // (sebelumnya chest/hips selalu dibalikin ke base → badan frontal kaku)

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
    // Group ngikut smoothing panel (jangan di-overwrite mouse)
    group.current.rotation.set(0, G.yaw, 0);
    // perhatian: nengok ke kartu yang di-hover + angguk dikit (smoothing biar halus)
    const att = attentionRef.current;
    const as = attSm.current;
    as.s += ((att.active ? 1 : 0) - as.s) * kk;
    as.dx += ((att.dx || 0) - as.dx) * kk;
    const attYaw = as.s * as.dx * 0.25;
    const attPitch = as.s * 0.16;
    // amarah dipicu klik kepala: geleng cepat + manyun (~1.4 detik).
    // Mata sengaja tetap melek (tanpa sipit) biar keliatan melotot marah.
    const at = performance.now() / 1000 - angerRef.start;
    let shakeYaw = 0, pout = 0, frown = 0;
    if (at >= 0 && at < 1.4) {
      const env = Math.sin((at / 1.4) * Math.PI);
      shakeYaw = Math.sin(at * 38) * 0.14 * env;
      pout = 0.12 * env;
      frown = env;
    }
    if (head) {
      // additive di atas rest-pose: jangan overwrite Euler (rest Head_06 tidak nol → snap)
      // bob dibuat kecil, hanya kepala yang gerak (badan dikunci)
      const base = headBase.current.get(head.name);
      const bob = Math.sin(t * 0.5) * 0.02 * ease;
      const hs = sm3("__head", P.head, kk);
      _qYaw.setFromAxisAngle(_Y_AXIS, yawRef.current + hs.y + attYaw + shakeYaw);
      _qPitch.setFromAxisAngle(_X_AXIS, pitchRef.current + bob + hs.x + attPitch + pout);
      _qRoll.setFromAxisAngle(_Z_AXIS, idleRotZ * 0.6 + hs.z);
      if (base) head.quaternion.copy(base).multiply(_qYaw).multiply(_qPitch).multiply(_qRoll);
      else head.quaternion.identity().multiply(_qYaw).multiply(_qPitch).multiply(_qRoll);
      // lacak posisi kepala buat deteksi klik (proyeksi ke layar di CharBackdrop)
      head.getWorldPosition(_vHead);
      headTrack.x = _vHead.x;
      headTrack.y = _vHead.y;
      headTrack.z = _vHead.z;
      headTrack.cam = camera;
      headTrack.valid = true;
    } else {
      headTrack.valid = false;
    }

    // ---- wajah dari panel (smoothing biar halus) ----
    const F = P.face ?? { eyeX: 0, eyeY: 0, blink: 0, smile: 1, auto: true };
    const fs = faceSm.current;
    fs.ex += ((F.eyeX || 0) - fs.ex) * kk;
    fs.ey += ((F.eyeY || 0) - fs.ey) * kk;
    fs.blink += ((F.blink || 0) - fs.blink) * kk;
    fs.smile += (((F.smile ?? 1)) - fs.smile) * kk;
    const blinkPhase = t % 6.5;
    const autoBlink = F.auto === false ? 0 : (blinkPhase < 0.22 ? Math.sin((blinkPhase / 0.22) * Math.PI) : 0);
    const blink = Math.min(1, autoBlink + fs.blink);
    _qEyeYaw.setFromAxisAngle(_Y_AXIS, yawRef.current * 0.45 + fs.ey + attYaw * 0.6);
    _qEyePitch.setFromAxisAngle(_X_AXIS, pitchRef.current * 0.35 + fs.ex + attPitch * 0.6);
    for (const eye of [faceRefs.current.leftEye, faceRefs.current.rightEye]) {
      if (!eye) continue;
      const base = restQuats.get(eye.name);
      const baseScale = restScales.get(eye.name);
      if (base) eye.quaternion.copy(base).multiply(_qEyeYaw).multiply(_qEyePitch);
      if (baseScale) eye.scale.set(baseScale.x, baseScale.y * (1 - blink * 0.85), baseScale.z);
    }
    const mouth = faceRefs.current.mouth;
    const mouthBase = mouth && restQuats.get(mouth.name);
    if (mouth && mouthBase) {
      // senyum ikut melebar dikit pas ada yang merhatiin kartunya
      _qSmileDyn.setFromAxisAngle(_Z_AXIS, -0.12 * fs.smile * (1 + as.s * 0.15));
      mouth.quaternion.copy(mouthBase).multiply(_qSmileDyn);
      // ngambek: mulut manyun (kebalikan senyum)
      if (frown > 0) {
        mouth.quaternion.multiply(_qTmp.setFromAxisAngle(_Z_AXIS, 0.3 * frown));
      }
    }
    // jari ngikut panel (smoothing biar halus)
    applyFingers("L", P.handL, kk);
    applyFingers("R", P.handR, kk);
  });

  // skala & posisi: duduk di kanan biar tidak ketutup kartu tengah, full-body kelihatan
  return (
    <group ref={group} position={[GROUP_X, MODEL_Y, 0]} scale={BASE_SCALE} rotation={[0, SIT_YAW, 0]}>
      <primitive object={gltf.scene} />
    </group>
  );
}

// rest-pose snapshot module-level: useGLTF cache + StrictMode/HMR bikin effect 2x,
// tanpa ini run kedua mengira pose-pertama = rest → hasil kurang turun / drift.
const restQuats = new Map<string, THREE.Quaternion>();
const restScales = new Map<string, THREE.Vector3>();

// tmp objects module-scope (hindari alokasi per-frame)
const _qTmp = new THREE.Quaternion();
const _qTmp2 = new THREE.Quaternion();
const _euler = new THREE.Euler();
const _qAdd = new THREE.Quaternion();
const _qSmileDyn = new THREE.Quaternion();
const _vHead = new THREE.Vector3();
const _qYaw = new THREE.Quaternion();
const _qPitch = new THREE.Quaternion();
const _qRoll = new THREE.Quaternion();
const _qEyeYaw = new THREE.Quaternion();
const _qEyePitch = new THREE.Quaternion();
const _X_AXIS = new THREE.Vector3(1, 0, 0);
const _Y_AXIS = new THREE.Vector3(0, 1, 0);
const _Z_AXIS = new THREE.Vector3(0, 0, 1);
const _qSmile = new THREE.Quaternion().setFromAxisAngle(_Z_AXIS, -0.12);
// Duduk Furina: paha horizontal (~83°), lutut nekuk ~87° biar shin vertikal
const _qSitThigh = new THREE.Quaternion().setFromAxisAngle(_X_AXIS, -1.45);
const _qSitKnee = new THREE.Quaternion().setFromAxisAngle(_X_AXIS, 1.52);
const _qSitAnkle = new THREE.Quaternion().setFromAxisAngle(_X_AXIS, -0.28);
// Silang ke SATU sisi (kanan di atas kiri): dua-duanya yaw positif, yang atas lebih besar
const _qSitTopCross = new THREE.Quaternion().setFromAxisAngle(_Y_AXIS, 0.62);
const _qSitBottomCross = new THREE.Quaternion().setFromAxisAngle(_Y_AXIS, 0.48);
// Tumpuk vertikal: kaki atas sedikit terangkat, bawah sedikit turun
const _qSitTopLift = new THREE.Quaternion().setFromAxisAngle(_Z_AXIS, -0.14);
const _qSitBottomLift = new THREE.Quaternion().setFromAxisAngle(_Z_AXIS, 0.08);
// Lutut: atas sedikit lebih lurus, bawah lebih nekuk + yaw searah biar shin rapat
const _qSitTopStraight = new THREE.Quaternion().setFromAxisAngle(_X_AXIS, -0.14);
const _qSitBottomBend = new THREE.Quaternion().setFromAxisAngle(_X_AXIS, 0.16);
const _qTopKneeYaw = new THREE.Quaternion().setFromAxisAngle(_Y_AXIS, 0.14);
const _qBottomKneeYaw = new THREE.Quaternion().setFromAxisAngle(_Y_AXIS, 0.1);
// Torso twist elegan (jangan frontal): pinggul + dada miring ke sisi kaki silang
const _qChestSit = new THREE.Quaternion().setFromAxisAngle(_Y_AXIS, 0.3)
  .multiply(new THREE.Quaternion().setFromAxisAngle(_X_AXIS, -0.08));
const _qHipsSit = new THREE.Quaternion().setFromAxisAngle(_Y_AXIS, 0.26);

useGLTF.preload("/char.glb");
