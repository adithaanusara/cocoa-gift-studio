"use client";

import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";
import { defaultBoxId, getGiftBox } from "@/config/giftBoxes";
import { getItem } from "@/config/items";
import { occupancyWith, replaceExtras } from "@/lib/packing";
import type { ExtraInstance, GiftBox, Placement, ScreenRect } from "@/lib/types";

export type BuilderEvent =
  | { id: number; type: "add"; key: string; itemId: string; placement: Placement | null; origin?: ScreenRect }
  | { id: number; type: "remove"; key: string; itemId: string; placement: Placement | null }
  | { id: number; type: "rejected"; itemId: string; reason: AddFailure };

export type AddFailure = "full" | "unavailable" | "already-added";

export interface Notice {
  id: number;
  tone: "success" | "warning" | "info";
  text: string;
}

interface BuilderState {
  boxId: string;
  extras: ExtraInstance[];
  note: string;
  /** Latest add/remove, read by the animation layer. */
  lastEvent: BuilderEvent | null;
  notice: Notice | null;

  selectBox: (boxId: string) => void;
  addItem: (itemId: string, origin?: ScreenRect) => { ok: true } | { ok: false; reason: AddFailure };
  removeOne: (itemId: string) => void;
  removeAll: (itemId: string) => void;
  clearExtras: () => void;
  setNote: (note: string) => void;
  dismissNotice: () => void;
}

let sequence = 0;
const nextId = () => ++sequence;

function boxOrDefault(id: string): GiftBox {
  return getGiftBox(id) ?? getGiftBox(defaultBoxId)!;
}

/** Storage that silently does nothing when localStorage is blocked. */
const safeStorage: StateStorage = {
  getItem: (name) => {
    try {
      return window.localStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: (name, value) => {
    try {
      window.localStorage.setItem(name, value);
    } catch {
      /* storage unavailable — builder still works for this visit */
    }
  },
  removeItem: (name) => {
    try {
      window.localStorage.removeItem(name);
    } catch {
      /* ignore */
    }
  },
};

interface PersistedBuilder {
  boxId?: string;
  extras?: { key: string; itemId: string }[];
  note?: string;
}

export const useBuilderStore = create<BuilderState>()(
  persist(
    (set, get) => ({
      boxId: defaultBoxId,
      extras: [],
      note: "",
      lastEvent: null,
      notice: null,

      selectBox: (boxId) => {
        const box = getGiftBox(boxId);
        if (!box || box.id === get().boxId) return;
        const { kept, dropped } = replaceExtras(box, get().extras);
        set({
          boxId: box.id,
          extras: kept,
          lastEvent: null,
          notice: dropped.length
            ? {
                id: nextId(),
                tone: "warning",
                text: `${dropped.length} extra ${dropped.length === 1 ? "item didn't" : "items didn't"} fit in the ${box.name}, so ${dropped.length === 1 ? "it was" : "they were"} removed.`,
              }
            : null,
        });
      },

      addItem: (itemId, origin) => {
        const item = getItem(itemId);
        const state = get();
        const box = boxOrDefault(state.boxId);
        const reject = (reason: AddFailure) => {
          const text =
            reason === "full"
              ? `No room left for ${item?.name ?? "that"} — remove something or choose a bigger box.`
              : reason === "already-added"
                ? `${item?.name ?? "That"} is already on your box.`
                : "That item isn't available right now.";
          set({ lastEvent: { id: nextId(), type: "rejected", itemId, reason }, notice: { id: nextId(), tone: "warning", text } });
          return { ok: false as const, reason };
        };

        if (!item || !item.available) return reject("unavailable");

        let placement: Placement | null = null;
        if (item.placement === "decoration") {
          if (state.extras.some((extra) => extra.itemId === itemId)) return reject("already-added");
        } else {
          placement = occupancyWith(box, state.extras).findSpot(item);
          if (!placement) return reject("full");
        }

        const key = `${itemId}-${nextId()}-${Date.now().toString(36)}`;
        set({
          extras: [...state.extras, { key, itemId, placement }],
          lastEvent: { id: nextId(), type: "add", key, itemId, placement, origin },
          notice: null,
        });
        return { ok: true as const };
      },

      removeOne: (itemId) => {
        const extras = get().extras;
        const index = extras.findLastIndex((extra) => extra.itemId === itemId);
        if (index === -1) return;
        const removed = extras[index];
        set({
          extras: extras.filter((_, i) => i !== index),
          lastEvent: { id: nextId(), type: "remove", key: removed.key, itemId, placement: removed.placement },
          notice: null,
        });
      },

      removeAll: (itemId) => {
        const extras = get().extras;
        const removed = extras.filter((extra) => extra.itemId === itemId);
        if (!removed.length) return;
        const last = removed[removed.length - 1];
        set({
          extras: extras.filter((extra) => extra.itemId !== itemId),
          lastEvent: { id: nextId(), type: "remove", key: last.key, itemId, placement: last.placement },
          notice: null,
        });
      },

      clearExtras: () => set({ extras: [], lastEvent: null, notice: null }),
      setNote: (note) => set({ note: note.slice(0, 300) }),
      dismissNotice: () => set({ notice: null }),
    }),
    {
      name: "happiness-box-builder",
      version: 1,
      storage: createJSONStorage(() => safeStorage),
      skipHydration: true,
      partialize: (state): PersistedBuilder => ({
        boxId: state.boxId,
        extras: state.extras.map(({ key, itemId }) => ({ key, itemId })),
        note: state.note,
      }),
      merge: (persisted, current) => {
        const saved = (persisted ?? {}) as PersistedBuilder;
        const box = boxOrDefault(saved.boxId ?? current.boxId);
        const savedExtras = Array.isArray(saved.extras)
          ? saved.extras.filter((extra) => typeof extra?.key === "string" && typeof extra?.itemId === "string")
          : [];
        const { kept } = replaceExtras(box, savedExtras);
        return {
          ...current,
          boxId: box.id,
          extras: kept,
          note: typeof saved.note === "string" ? saved.note.slice(0, 300) : "",
        };
      },
    },
  ),
);

/** Ephemeral UI state for drag-and-drop. Not persisted. */
interface StageState {
  dragItemId: string | null;
  overDropZone: boolean;
  setDrag: (itemId: string | null) => void;
  setOverDropZone: (over: boolean) => void;
}

export const useStageStore = create<StageState>()((set) => ({
  dragItemId: null,
  overDropZone: false,
  setDrag: (dragItemId) => set(dragItemId ? { dragItemId } : { dragItemId: null, overDropZone: false }),
  setOverDropZone: (overDropZone) => set({ overDropZone }),
}));
