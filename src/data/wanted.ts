import { moreRepos, profile, projects } from "../lib/github";
import type { Project } from "../lib/github";

// Lapisan BURONAN di atas data GitHub asli. Tidak ada angka inventasi:
// semua nama, link, bahasa, dan deskripsi berasal dari lib/github.ts.
export type CaseFile = Project & {
  caseNo: string;
  status: "DEPLOYED" | "SOURCE ONLY";
};

export const caseFiles: CaseFile[] = projects.map((p, i) => ({
  ...p,
  caseNo: `00${i + 1}`,
  status: p.demoUrl ? "DEPLOYED" : "SOURCE ONLY",
}));

export type TrailStop = {
  stage: string;
  place: string;
  desc: string;
};

export const trail: TrailStop[] = [
  { stage: "SD", place: "SDN 1 Kalijati", desc: "Awal mula sekolah di Kalijati." },
  { stage: "SMP", place: "SMPN 1 Kalijati", desc: "Lanjut ke SMP, masih di Kalijati." },
  {
    stage: "SMK",
    place: "SMKN 2 Subang",
    desc: "Pindah ke Subang untuk SMK — di sini mulai kenal dunia teknologi.",
  },
  {
    stage: "PKL",
    place: "PT Gothru Media Indonesia",
    desc: "Turun langsung ke dunia kerja lewat praktik kerja lapangan.",
  },
];

export { moreRepos, profile };
