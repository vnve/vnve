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

interface CanvasSettings {
  width: number;
  height: number;
}

interface SettingsState {
  ai: AISettings | null;
  updateAI: (ai: AISettings) => void;
  tts: TTSSettings | null;
  updateTTS: (tts: TTSSettings) => void;
  canvas: CanvasSettings;
  updateCanvas: (canvas: CanvasSettings) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ai: null,
      updateAI: (ai: AISettings) => set({ ai }),
      tts: null,
      updateTTS: (tts: TTSSettings) => set({ tts }),
      canvas: {
        width: 1920,
        height: 1080,
      },
      updateCanvas: (canvas: CanvasSettings) => set({ canvas }),
    }),
    {
      name: "settings",
    },
  ),
);
