import { create } from "zustand";
import { persist } from "zustand/middleware";
import { SEED_TENDERS } from "./seed";
import type { ChecklistItem, Comment, Tender, TenderStatus } from "./types";

interface TenderState {
  tenders: Tender[];
  setStatus: (id: string, status: TenderStatus) => void;
  toggleChecklist: (tenderId: string, itemId: string) => void;
  addComment: (tenderId: string, author: string, text: string) => void;
  addChecklistItem: (tenderId: string, item: Omit<ChecklistItem, "id">) => void;
  reset: () => void;
}

export const useTenderStore = create<TenderState>()(
  persist(
    (set) => ({
      tenders: SEED_TENDERS,
      setStatus: (id, status) =>
        set((s) => ({
          tenders: s.tenders.map((t) => (t.id === id ? { ...t, status } : t)),
        })),
      toggleChecklist: (tenderId, itemId) =>
        set((s) => ({
          tenders: s.tenders.map((t) =>
            t.id !== tenderId
              ? t
              : {
                  ...t,
                  checklist: t.checklist.map((c) =>
                    c.id === itemId ? { ...c, completed: !c.completed } : c,
                  ),
                },
          ),
        })),
      addComment: (tenderId, author, text) =>
        set((s) => ({
          tenders: s.tenders.map((t) =>
            t.id !== tenderId
              ? t
              : {
                  ...t,
                  comments: [
                    ...t.comments,
                    {
                      id: crypto.randomUUID(),
                      author,
                      text,
                      timestamp: new Date().toISOString(),
                    } satisfies Comment,
                  ],
                },
          ),
        })),
      addChecklistItem: (tenderId, item) =>
        set((s) => ({
          tenders: s.tenders.map((t) =>
            t.id !== tenderId
              ? t
              : { ...t, checklist: [...t.checklist, { ...item, id: crypto.randomUUID() }] },
          ),
        })),
      reset: () => set({ tenders: SEED_TENDERS }),
    }),
    { name: "nexmotion-tenders-v1" },
  ),
);

export const formatZAR = (v: number) =>
  new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  }).format(v);
