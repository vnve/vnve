import { DEFAULT_AUDIO_CONFIG, DEFAULT_VIDEO_CONFIG } from "./constant";

export async function checkEnv() {
  let video = false;
  let audio = false;

  if (
    typeof VideoEncoder !== "undefined" &&
    typeof VideoFrame !== "undefined" &&
    (await VideoEncoder.isConfigSupported(DEFAULT_VIDEO_CONFIG)).supported
  ) {
    video = true;
  }

  if (
    typeof OfflineAudioContext !== "undefined" &&
    typeof AudioEncoder !== "undefined" &&
    typeof AudioData !== "undefined" &&
    (await AudioEncoder.isConfigSupported(DEFAULT_AUDIO_CONFIG)).supported
  ) {
    audio = true;
  }

  return {
    video,
    audio,
  };
}
