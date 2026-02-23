"use client";

import { create } from "zustand";

// ── State shape ───────────────────────────────────────────────────────────────

interface ViewState {
  width: number;
  height: number;
  format: string;
  sceneData: string | null;
  result: Record<string, unknown> | null;
  loading: boolean;

  setWidth: (v: number) => void;
  setHeight: (v: number) => void;
  setFormat: (v: string) => void;
  setSceneData: (v: string) => void;
  setResult: (v: Record<string, unknown> | null) => void;
  setLoading: (v: boolean) => void;
  reset: () => void;
}

// ── Defaults ──────────────────────────────────────────────────────────────────

const DEFAULT_WIDTH = 1920;
const DEFAULT_HEIGHT = 1080;
const DEFAULT_FORMAT = "PNG";

// ── Store ─────────────────────────────────────────────────────────────────────

export const useViewStore = create<ViewState>((set) => ({
  width: DEFAULT_WIDTH,
  height: DEFAULT_HEIGHT,
  format: DEFAULT_FORMAT,
  sceneData: null,
  result: null,
  loading: false,

  setWidth: (v) => set({ width: v }),
  setHeight: (v) => set({ height: v }),
  setFormat: (v) => set({ format: v }),
  setSceneData: (v) => set({ sceneData: v }),
  setResult: (v) => set({ result: v }),
  setLoading: (v) => set({ loading: v }),

  reset: () =>
    set({
      width: DEFAULT_WIDTH,
      height: DEFAULT_HEIGHT,
      format: DEFAULT_FORMAT,
      sceneData: null,
      result: null,
      loading: false,
    }),
}));
