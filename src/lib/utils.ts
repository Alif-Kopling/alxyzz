// cn() minimal tanpa deps tambahan (pengganti clsx + tailwind-merge)
// Cukup untuk kebutuhan apple-hello-effect + preloader.
export function cn(...inputs: Array<string | false | null | undefined>): string {
  return inputs.filter(Boolean).join(" ");
}
