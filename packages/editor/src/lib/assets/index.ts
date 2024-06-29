import { PRESET_IMAGE_ASSETS } from "./image";
import { PRESET_AUDIO_ASSETS } from "./audio";

export interface AssetItem {
  id: number;
  name: string;
  type: string[];
  tag: string[];
  source: string;
  sourceType?: string;
}

export const PRESET_IMAGE_TYPE_OPTIONS = [
  {
    name: "背景",
    value: "background",
  },
  {
    name: "立绘",
    value: "character",
  },
  {
    name: "对话框",
    value: "dialog",
  },
  {
    name: "其他",
    value: "other",
  },
];

export const PRESET_AUDIO_TYPE_OPTIONS = [
  {
    name: "配乐",
    value: "music",
  },
  {
    name: "音效",
    value: "effect",
  },
];

export const PRESET_ASSETS: AssetItem[] = [
  ...PRESET_IMAGE_ASSETS,
  ...PRESET_AUDIO_ASSETS,
].map((item, index) => {
  return {
    ...item,
    id: 100000 + index,
  };
});
