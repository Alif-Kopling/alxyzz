import { useState } from "react";
import type { FormEvent } from "react";
import { GithubLogo, PaperPlaneTilt } from "@phosphor-icons/react";
import { Reveal } from "./Reveal";
import { profile } from "../data/wanted";

// Nomor WhatsApp tujuan (format internasional tanpa +, spasi, atau strip)
const WA_NUMBER = "6285134394748";

type Status = "idle" | "sending" | "sent" | "error";

export function ReportContact() {
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
    <section id="lapor" className="mx-auto max-w-7xl scroll-mt-24 px-4 pb-16 md:px-6 md:pb-24">
      <div className="paper-raised card-dossier grid gap-10 bg-paper-card p-7 md:grid-cols-2 md:p-12">
        <Reveal>
          <div>
            <p className="font-mono text-[11px] font-bold tracking-[0.22em] text-stamp uppercase">
              Kantor Laporan
            </p>
            <h2 className="font-display mt-3 max-w-[14ch] text-3xl font-extrabold tracking-tighter text-ink uppercase md:text-4xl">
              Lihat buronan? Rekrut sekarang
            </h2>
            <p className="mt-3 max-w-[46ch] text-base leading-relaxed text-ink-soft">
              Ceritakan kebutuhan secara singkat. Saya balas dalam satu hari kerja dengan
              langkah berikutnya.
            </p>
            <a
              href={profile.htmlUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex items-center gap-2 font-mono text-sm text-ink-soft hover:text-ink"
            >
              <GithubLogo size={16} weight="bold" />
              github.com/Alif-Kopling
            </a>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          {status === "sent" ? (
            <div className="card-dossier bg-paper-deep p-7">
              <p className="font-display text-xl font-extrabold text-ink">Membuka WhatsApp…</p>
              <p className="mt-2 text-base text-ink-soft">
                Laporan kamu sudah disiapkan di chat. Tinggal pencet kirim di WhatsApp, saya
                balas dalam satu hari kerja.
              </p>
              {waUrl && (
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-stamp underline-offset-4 hover:underline"
                >
                  <PaperPlaneTilt size={16} weight="bold" />
                  Klik di sini kalau WhatsApp tidak terbuka
                </a>
              )}
              <div>
                <button
                  type="button"
                  onClick={resetForm}
                  className="mt-6 text-sm font-semibold text-ink-soft underline-offset-4 hover:text-ink hover:underline"
                >
                  Kirim laporan lain
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={onSubmit} noValidate className="grid gap-4">
              <div className="grid gap-2">
                <label htmlFor="nama" className="text-sm font-semibold text-ink">
                  Nama
                </label>
                <input
                  id="nama"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama kamu"
                  autoComplete="name"
                  className="card-dossier border border-ink/30 bg-paper px-4 py-3.5 text-base text-ink placeholder:text-ink-soft/60 focus:border-stamp focus:outline-2 focus:outline-stamp"
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="email" className="text-sm font-semibold text-ink">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  autoComplete="email"
                  className="card-dossier border border-ink/30 bg-paper px-4 py-3.5 text-base text-ink placeholder:text-ink-soft/60 focus:border-stamp focus:outline-2 focus:outline-stamp"
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="pesan" className="text-sm font-semibold text-ink">
                  Pesan
                </label>
                <textarea
                  id="pesan"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ceritakan proyek secara singkat"
                  rows={4}
                  className="card-dossier border border-ink/30 bg-paper px-4 py-3.5 text-base text-ink placeholder:text-ink-soft/60 focus:border-stamp focus:outline-2 focus:outline-stamp"
                />
              </div>
              {status === "error" && error && (
                <p role="alert" className="text-sm font-semibold text-stamp">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={status === "sending"}
                className="btn-wanted inline-flex items-center justify-center gap-2 bg-stamp px-6 py-3.5 text-sm font-semibold text-white transition-transform hover:brightness-110 disabled:opacity-60"
              >
                <PaperPlaneTilt size={16} weight="bold" />
                {status === "sending" ? "Mengirim via WhatsApp" : "Lapor / Rekrut"}
              </button>
            </form>
          )}
        </Reveal>
      </div>

      <footer className="flex flex-col items-center justify-between gap-4 pt-12 sm:flex-row">
        <p className="font-mono text-xs tracking-[0.14em] text-ink-soft uppercase">
          Wanted archive — Alxyzz © 2026
        </p>
        <ul className="flex items-center gap-5">
          <li>
            <a href="#berkas" className="text-sm text-ink-soft hover:text-ink">
              Berkas
            </a>
          </li>
          <li>
            <a href="#senjata" className="text-sm text-ink-soft hover:text-ink">
              Senjata
            </a>
          </li>
          <li>
            <a href="#lapor" className="text-sm text-ink-soft hover:text-ink">
              Lapor
            </a>
          </li>
        </ul>
      </footer>
    </section>
  );
}
