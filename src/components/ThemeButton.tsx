import { useEffect } from "react";
import { Moon } from "@phosphor-icons/react";

// Reusable theme switch. Rendered inside the menu bar.
// Single instance per page to keep one visible control per intent.
export function ThemeButton({ className = "" }: { className?: string }) {
  useEffect(() => {
    document.documentElement.classList.add("dark");
    window.localStorage.setItem("theme", "dark");
  }, []);

  return (
    <span
      aria-label="Dark mode terkunci"
      title="Dark mode terkunci"
      className={`inline-flex rounded-full p-2 text-zinc-300 ${className}`}
    >
      <Moon size={16} weight="bold" />
    </span>
  );
}
