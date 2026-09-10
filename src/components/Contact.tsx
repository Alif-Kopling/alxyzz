import { useState } from "react";
import type { FormEvent } from "react";
import { GithubLogo, PaperPlaneTilt } from "@phosphor-icons/react";
import { Reveal } from "./Reveal";
import { profile } from "../lib/github";

type Status = "idle" | "sending" | "sent" | "error";

// Nomor WhatsApp tujuan (format internasional tanpa +, spasi, atau strip)
const WA_NUMBER = "6285134394748";

export function Contact() {
  const [status, setStatus] = useState<Status>("idle");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [waUrl, setWaUrl] = useState("");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError("Lengkapi nama, email, dan pesan dulu.");
      setStatus("error");
      return;
    }
    setError("");
    const text = encodeURIComponent(
      `Halo Alxyzz! Saya ${name.trim()} (${email.trim()}).\n\n${message.trim()}`,
    );
    const url = `https://wa.me/${WA_NUMBER}?text=${text}`;
    setWaUrl(url);
    setStatus("sending");
    // Dibuka dari user gesture (submit) jadi lolos popup blocker di mayoritas browser.
    // Kalau keblokir, layar sent kasih link cadangan manual.
    window.open(url, "_blank", "noopener");
    window.setTimeout(() => {
      setStatus("sent");
    }, 600);
  }

  function resetForm() {
    setStatus("idle");
    setMessage("");
    setError("");
  }

  return (
    <section id="contact" className="mx-auto max-w-7xl scroll-mt-20 px-4 pb-20 md:px-6 md:pb-28">
      <div className="card-soft grid gap-10 bg-white p-7 md:grid-cols-[1fr_1fr] md:p-12 dark:bg-zinc-950">
        <Reveal>
          <div>
            <h2 className="font-display max-w-[16ch] text-3xl font-semibold tracking-tighter text-zinc-950 md:text-4xl dark:text-zinc-50">
              Punya proyek minggu ini
            </h2>
            <p className="mt-3 max-w-[46ch] text-base leading-relaxed text-zinc-600 dark:text-zinc-300">
              Ceritakan kebutuhan secara singkat. Saya balas dalam satu hari
              kerja dengan langkah berikutnya.
            </p>
            <a
              href={profile.htmlUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex items-center gap-2 font-mono text-sm text-zinc-600 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white"
            >
              <GithubLogo size={16} weight="bold" />
              github.com/Alif-Kopling
            </a>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          {status === "sent" ? (
            <div className="rounded-2xl bg-zinc-100 p-7 dark:bg-zinc-900">
              <p className="font-display text-xl font-semibold text-zinc-950 dark:text-zinc-50">
                Membuka WhatsApp…
              </p>
              <p className="mt-2 text-base text-zinc-600 dark:text-zinc-300">
                Pesan kamu sudah disiapkan di chat. Tinggal pencet kirim di
                WhatsApp, saya balas dalam satu hari kerja.
              </p>
              {waUrl && (
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#2440ff] underline-offset-4 hover:underline dark:text-[#8ea2ff]"
                >
                  <PaperPlaneTilt size={16} weight="bold" />
                  Klik di sini kalau WhatsApp tidak terbuka
                </a>
              )}
              <div>
                <button
                  type="button"
                  onClick={resetForm}
                  className="mt-6 text-sm font-semibold text-zinc-500 underline-offset-4 hover:text-zinc-900 hover:underline dark:text-zinc-400 dark:hover:text-zinc-100"
                >
                  Kirim pesan lain
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={onSubmit} noValidate className="grid gap-4">
              <div className="grid gap-2">
                <label htmlFor="nama" className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                  Nama
                </label>
                <input
                  id="nama"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama kamu"
                  autoComplete="name"
                  className="rounded-lg border border-zinc-300 bg-white px-4 py-3.5 text-base text-zinc-950 placeholder:text-zinc-400 focus:border-[#2440ff] focus:outline-2 focus:outline-[#2440ff] dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus:border-[#8ea2ff] dark:focus:outline-[#8ea2ff]"
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="email" className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  autoComplete="email"
                  className="rounded-lg border border-zinc-300 bg-white px-4 py-3.5 text-base text-zinc-950 placeholder:text-zinc-400 focus:border-[#2440ff] focus:outline-2 focus:outline-[#2440ff] dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus:border-[#8ea2ff] dark:focus:outline-[#8ea2ff]"
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="pesan" className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                  Pesan
                </label>
                <textarea
                  id="pesan"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ceritakan proyek secara singkat"
                  rows={4}
                  className="rounded-lg border border-zinc-300 bg-white px-4 py-3.5 text-base text-zinc-950 placeholder:text-zinc-400 focus:border-[#2440ff] focus:outline-2 focus:outline-[#2440ff] dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus:border-[#8ea2ff] dark:focus:outline-[#8ea2ff]"
                />
              </div>
              {status === "error" && error && (
                <p role="alert" className="text-sm font-semibold text-red-600 dark:text-red-300">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={status === "sending"}
                className="btn-primary inline-flex items-center justify-center gap-2 bg-[#2440ff] px-6 py-3.5 text-sm font-semibold text-white transition-transform hover:brightness-110 disabled:opacity-60 dark:bg-[#8ea2ff] dark:text-[#09090b]"
              >
                <PaperPlaneTilt size={16} weight="bold" />
                {status === "sending" ? "Membuka WhatsApp" : "Hubungi Saya"}
              </button>
            </form>
          )}
        </Reveal>
      </div>

      <footer className="flex flex-col items-center justify-between gap-4 pt-12 sm:flex-row">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Alxyzz, frontend developer. Hak cipta 2026.
        </p>
        <ul className="flex items-center gap-5">
          <li>
            <a href="#projects" className="text-sm text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50">
              Projects
            </a>
          </li>
          <li>
            <a href="#skills" className="text-sm text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50">
              Skills
            </a>
          </li>
          <li>
            <a href="#contact" className="text-sm text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50">
              Contact
            </a>
          </li>
        </ul>
      </footer>
    </section>
  );
}
