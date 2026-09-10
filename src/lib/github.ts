// Data asli dari GitHub Alif-Kopling, diambil 2026-09-09 via api.github.com.
// Profil: https://github.com/Alif-Kopling
// Avatar: https://avatars.githubusercontent.com/u/197850978?v=4
export const profile = {
  name: "Alxyzz",
  username: "Alif-Kopling",
  avatar: "https://avatars.githubusercontent.com/u/197850978?v=4",
  bio: "Berikan aku seporsi nasgor maka akan kutunjukkan cara membuat website.",
  company: "pt.mikir kids",
  location: "Indonesia",
  htmlUrl: "https://github.com/Alif-Kopling",
  publicRepos: 10,
  followers: 22,
  following: 23,
};

export type Project = {
  name: string;
  desc: string;
  language: string;
  repoUrl: string;
  demoUrl: string | null;
  seed: string;
  alt: string;
  preview: string;
};

// Tiga repo pilihan, semua data nama dan link asli dari GitHub.
export const projects: Project[] = [
  {
    name: "realchat-web",
    desc: "Aplikasi chat realtime yang siap deploy ke Vercel. Fokus pada alur pesan yang cepat dan tampilan yang ringan.",
    language: "TypeScript",
    repoUrl: "https://github.com/Alif-Kopling/realchat-web",
    demoUrl: "https://hallo-wok.vercel.app",
    seed: "alxyzz-realchat-web",
    alt: "Tampilan aplikasi chat realchat-web",
    preview: "/preview-realchat.png",
  },
  {
    name: "landing-page",
    desc: "Landing page Subang yang cepat dan responsif. Dibangun dengan TypeScript dan siap tayang di Vercel.",
    language: "TypeScript",
    repoUrl: "https://github.com/Alif-Kopling/landing-page",
    demoUrl: "https://subang-landing-page.vercel.app",
    seed: "alxyzz-landing-page",
    alt: "Tampilan landing page Subang",
    preview: "/preview-landingpage.png",
  },
  {
    name: "Archivio-fe",
    desc: "Frontend aplikasi arsip dengan lisensi MIT. Antarmuka rapi untuk kelola dokumen.",
    language: "TypeScript",
    repoUrl: "https://github.com/Alif-Kopling/Archivio-fe",
    demoUrl: null,
    seed: "alxyzz-archivio-fe",
    alt: "Tampilan frontend Archivio",
    preview: "/preview-archivio.png",
  },
];

export const moreRepos = [
  {
    name: "LaundryKu",
    desc: "Aplikasi Manajemen Laundry.",
    repoUrl: "https://github.com/Alif-Kopling/LaundryKu",
  },
  {
    name: "aelindra-rpg",
    desc: "Game RPG berbasis web.",
    repoUrl: "https://github.com/Alif-Kopling/aelindra-rpg",
  },
  {
    name: "lending-page-hallowok",
    desc: "Landing page Hallowok dengan demo live.",
    repoUrl: "https://github.com/Alif-Kopling/lending-page-hallowok",
  },
];
