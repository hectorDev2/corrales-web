import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserData {
  name: string;
  phone: string;
}

interface UserStore {
  user: UserData | null;

  // Actions
  saveUser: (data: UserData) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,

      saveUser: (data) => set({ user: data }),

      clearUser: () => set({ user: null }),
    }),
    {
      name: "corrales-user",
    },
  ),
);
