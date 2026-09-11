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
  {
    stage: "MISSING",
    place: "Keberadaan Tidak Diketahui",
    desc: "Lulus dari SMK. Terakhir terlihat menyiapkan lamaran kerja dan pendaftaran kuliah. Laporkan bila melihat.",
  },
];

export { moreRepos, profile };

// Berkas identitas target — data asli, verbatim dari file pemilik.
export const wantedFile = {
  caseId: "ALX-017",
  status: "At Large",
  threat: "High",
  classification: "Frontend Developer",
  identity: [
    { label: "Nama", value: "Muhammad Alif Fakhri Zain" },
    { label: "Alias", value: "Alxyzz" },
    { label: "Usia", value: "17 tahun" },
    { label: "Domisili", value: "Subang-Jawa Barat-Indonesia" },
    { label: "Status", value: "Pelajar" },
    { label: "Jurusan", value: "Rekayasa Perangkat Lunak (RPL)" },
    { label: "Sekolah", value: "SMK Negeri 2 Subang" },
  ],
  profile: [
    "Target dikenal sebagai seorang pelajar RPL yang memiliki ketertarikan kuat terhadap pengembangan perangkat lunak, khususnya pada bidang frontend development.",
    "Memiliki kecenderungan untuk mengubah ide menjadi antarmuka web yang interaktif, eksperimental, dan tidak selalu mengikuti format portfolio konvensional.",
    "Target diketahui lebih sering ditemukan bersama terminal, browser, Git, dan berbagai proyek yang sedang dalam tahap development.",
  ],
};
