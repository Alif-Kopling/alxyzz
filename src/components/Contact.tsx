import { useState } from "react";
import type { FormEvent } from "react";
import { GithubLogo, PaperPlaneTilt } from "@phosphor-icons/react";
import { Reveal } from "./Reveal";
import { profile } from "../lib/github";

type Status = "idle" | "sending" | "sent" | "error";

export function Contact() {
  const [status, setStatus] = useState<Status>("idle");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError("Lengkapi nama, email, dan pesan dulu.");
      setStatus("error");
      return;
    }
    setError("");
    setStatus("sending");
    window.setTimeout(() => {
      setStatus("sent");
    }, 900);
  }

  return (
    <section id="contact" className="mx-auto max-w-7xl scroll-mt-20 px-4 pb-20 md:px-6 md:pb-28">
      <div className="card-soft grid gap-10 bg-zinc-950 p-7 md:grid-cols-[1fr_1fr] md:p-12 dark:bg-zinc-100">
        <Reveal>
          <div>
            <h2 className="font-display max-w-[16ch] text-3xl font-semibold tracking-tighter text-zinc-50 md:text-4xl dark:text-zinc-950">
              Punya proyek minggu ini
            </h2>
            <p className="mt-3 max-w-[46ch] text-base leading-relaxed text-zinc-300 dark:text-zinc-600">
              Ceritakan kebutuhan secara singkat. Saya balas dalam satu hari
              kerja dengan langkah berikutnya.
            </p>
            <a
              href={profile.htmlUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex items-center gap-2 font-mono text-sm text-zinc-300 hover:text-white dark:text-zinc-600 dark:hover:text-zinc-950"
            >
              <GithubLogo size={16} weight="bold" />
              github.com/Alif-Kopling
            </a>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          {status === "sent" ? (
            <div className="rounded-2xl bg-zinc-900 p-7 dark:bg-white">
              <p className="font-display text-xl font-semibold text-zinc-50 dark:text-zinc-950">
                Pesan terkirim.
              </p>
              <p className="mt-2 text-base text-zinc-300 dark:text-zinc-600">
                Terima kasih sudah menulis. Saya akan membalas lewat email.
              </p>
            </div>
          ) : (
            <form onSubmit={onSubmit} noValidate className="grid gap-4">
              <div className="grid gap-2">
                <label htmlFor="nama" className="text-sm font-semibold text-zinc-100 dark:text-zinc-800">
                  Nama
                </label>
                <input
                  id="nama"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama kamu"
                  autoComplete="name"
                  className="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3.5 text-base text-zinc-50 placeholder:text-zinc-500 focus:border-[#8ea2ff] focus:outline-2 focus:outline-[#8ea2ff] dark:border-zinc-300 dark:bg-white dark:text-zinc-950 dark:placeholder:text-zinc-400"
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="email" className="text-sm font-semibold text-zinc-100 dark:text-zinc-800">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  autoComplete="email"
                  className="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3.5 text-base text-zinc-50 placeholder:text-zinc-500 focus:border-[#8ea2ff] focus:outline-2 focus:outline-[#8ea2ff] dark:border-zinc-300 dark:bg-white dark:text-zinc-950 dark:placeholder:text-zinc-400"
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="pesan" className="text-sm font-semibold text-zinc-100 dark:text-zinc-800">
                  Pesan
                </label>
                <textarea
                  id="pesan"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ceritakan proyek secara singkat"
                  rows={4}
                  className="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3.5 text-base text-zinc-50 placeholder:text-zinc-500 focus:border-[#8ea2ff] focus:outline-2 focus:outline-[#8ea2ff] dark:border-zinc-300 dark:bg-white dark:text-zinc-950 dark:placeholder:text-zinc-400"
                />
              </div>
              {status === "error" && error && (
                <p role="alert" className="text-sm font-semibold text-red-300 dark:text-red-600">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={status === "sending"}
                className="btn-primary inline-flex items-center justify-center gap-2 bg-[#8ea2ff] px-6 py-3.5 text-sm font-semibold text-[#09090b] transition-transform hover:brightness-110 disabled:opacity-60 dark:bg-[#2440ff] dark:text-white"
              >
                <PaperPlaneTilt size={16} weight="bold" />
                {status === "sending" ? "Mengirim" : "Hubungi Saya"}
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
