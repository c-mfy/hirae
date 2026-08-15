import { useEffect, useState } from 'react';

export function useElapsed(startedAt: number | null, nowOverride?: number): number {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!startedAt || nowOverride != null) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [startedAt, nowOverride]);

  if (!startedAt) return 0;
  return (nowOverride ?? now) - startedAt;
}