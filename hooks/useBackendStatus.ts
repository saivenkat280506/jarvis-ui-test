"use client";

import { useEffect, useRef, useState } from "react";
import { JARVIS_BACKEND } from "@/lib/backend";

export type BackendStatus = "online" | "offline" | "checking";

export function useBackendStatus(intervalMs = 5000) {
  const [status, setStatus] = useState<BackendStatus>("checking");
  const [latency, setLatency] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const statusRef = useRef<BackendStatus>("checking");

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      const start = performance.now();
      try {
        const res = await fetch(`${JARVIS_BACKEND}/health`, {
          method: "GET",
          cache: "no-store",
          signal: AbortSignal.timeout(3000),
        });
        if (cancelled) return;
        const ms = Math.round(performance.now() - start);
        if (res.ok || res.status < 500) {
          statusRef.current = "online";
          setStatus("online");
          setLatency(ms);
        } else {
          statusRef.current = "offline";
          setStatus("offline");
          setLatency(null);
        }
      } catch {
        if (cancelled) return;
        statusRef.current = "offline";
        setStatus("offline");
        setLatency(null);
      }
    };

    const tick = () => {
      const delay =
        statusRef.current === "online" ? intervalMs : Math.min(intervalMs, 2000);
      timerRef.current = setTimeout(async () => {
        await check();
        if (!cancelled) tick();
      }, delay);
    };

    void check().then(() => {
      if (!cancelled) tick();
    });

    return () => {
      cancelled = true;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [intervalMs]);

  return { status, latency, isOnline: status === "online" };
}
