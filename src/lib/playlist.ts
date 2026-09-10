// Playlist asli, file ada di public/audio.
export type Track = {
  src: string;
  title: string;
  artist: string;
};

export const playlist: Track[] = [
  {
    src: "/audio/Katy Perry - The One That Got Away (Cover by Brielle Von Hugel) - Brielle Von Hugel (youtube).mp3",
    title: "The One That Got Away (Cover)",
    artist: "Brielle Von Hugel",
  },
  {
    src: "/audio/The Lantis - Lampu Merah (Official Lyric Video) - The Lantis (youtube).mp3",
    title: "Lampu Merah",
    artist: "The Lantis",
  },
  {
    src: "/audio/Yovie & Nuno - Tanpa Cinta (Video Clip) - YovieAndNunoVEVO (youtube).mp3",
    title: "Tanpa Cinta",
    artist: "Yovie & Nuno",
  },
];
