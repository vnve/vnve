// music
import music1 from "../../assets/audio/music/music1.mp3";
import music2 from "../../assets/audio/music/music2.mp3";

// effect
import bird from "../../assets/audio/effect/bird.mp3";
import bell from "../../assets/audio/effect/bell.mp3";
import shoot from "../../assets/audio/effect/shoot.wav";
import { assetFactory } from "../utils";

const musicAssets = assetFactory(
  [
    {
      name: "背景音乐1",
      source: music1,
    },
    {
      name: "背景音乐2",
      source: music2,
    },
  ],
  ["audio", "music"],
);

const effectAssets = assetFactory(
  [
    {
      name: "鸟声",
      source: bird,
    },
    {
      name: "钟声",
      source: bell,
    },
    {
      name: "枪声",
      source: shoot,
    },
  ],
  ["audio", "effect"],
);

export const PRESET_AUDIO_ASSETS = [...musicAssets, ...effectAssets];
