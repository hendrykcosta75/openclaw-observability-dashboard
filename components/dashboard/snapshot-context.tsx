"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { SnapshotView } from "@/lib/openclaw-snapshot-types";

interface SnapshotContextValue {
  view: SnapshotView;
}

const SnapshotContext = createContext<SnapshotContextValue | null>(null);

export function SnapshotProvider({
  children,
  initialView,
}: {
  children: React.ReactNode;
  initialView: SnapshotView;
}) {
  const [view, setView] = useState<SnapshotView>(initialView);

  useEffect(() => {
    let cancelled = false;
    const intervalId = setInterval(async () => {
      try {
        const res = await fetch("/api/observability/snapshot", {
          credentials: "include",
          cache: "no-store",
          headers: { Accept: "application/json" },
        });
        if (cancelled) return;
        if (res.ok) {
          const next: SnapshotView = await res.json();
          setView(next);
        }
      } catch {
        // keep last good view
      }
    }, 15_000);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, []);

  return <SnapshotContext.Provider value={{ view }}>{children}</SnapshotContext.Provider>;
}

export function useSnapshot(): SnapshotView {
  const ctx = useContext(SnapshotContext);
  if (!ctx) {
    throw new Error("useSnapshot must be used inside <SnapshotProvider>");
  }
  return ctx.view;
}
