import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface TableSession {
  token: string;
  label: string;
  zone: string;
}

interface TableSessionStore {
  table: TableSession | null;
  setTable: (table: TableSession) => void;
  clearTable: () => void;
}

/** Mesa a la que está vinculado el cliente tras escanear el QR. */
export const useTableSession = create<TableSessionStore>()(
  persist(
    (set) => ({
      table: null,
      setTable: (table) => set({ table }),
      clearTable: () => set({ table: null }),
    }),
    { name: "corrales-table-session" },
  ),
);
