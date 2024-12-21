import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AiSettings {
  platform: string;
  key: string;
  model: string;
}

interface SettingsState {
  ai: AiSettings | null;
  updateAi: (ai: AiSettings) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ai: null,
      updateAi: (ai: AiSettings) => set({ ai }),
    }),
    {
      name: "settings",
    },
  ),
);
