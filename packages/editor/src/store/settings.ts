import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AISettings {
  platform: string;
  key: string;
  model: string;
}

interface TTSSettings {
  appid: string;
  token: string;
}

interface SettingsState {
  ai: AISettings | null;
  updateAI: (ai: AISettings) => void;
  tts: TTSSettings | null;
  updateTTS: (tts: TTSSettings) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ai: null,
      updateAI: (ai: AISettings) => set({ ai }),
      tts: null,
      updateTTS: (tts: TTSSettings) => set({ tts }),
    }),
    {
      name: "settings",
    },
  ),
);
