import { create } from "zustand";
import { StoryScene } from "@/lib/core";
import { DBAsset } from "@/db";

interface PendingSceneData {
  story: StoryScene[];
  characterAssetMap: Record<string, DBAsset | null>;
  backgroundAssetMap: Record<string, DBAsset | null>;
  sceneTemplateName?: string;
  importInputText: string;
  projectName: string;
}

interface PendingSceneStore {
  pendingData: PendingSceneData | null;
  setPendingData: (data: PendingSceneData | null) => void;
  clearPendingData: () => void;
}

export const usePendingSceneStore = create<PendingSceneStore>((set) => ({
  pendingData: null,
  setPendingData: (data) => set({ pendingData: data }),
  clearPendingData: () => set({ pendingData: null }),
}));
