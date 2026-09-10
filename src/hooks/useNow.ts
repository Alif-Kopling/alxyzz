import { useEffect, useState } from "react";

// Live clock source for the desktop menu bar. Interval based with cleanup.
// Not scroll driven, so no Motion value needed here.
export function useNow(intervalMs = 5000) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);

  return now;
}
