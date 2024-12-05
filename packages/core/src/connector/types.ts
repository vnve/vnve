export enum CompositorWorkerMessageType {
  LOADED = "loaded",
  INIT = "init",
  SEND = "send",
  FINISH = "finish",
}

export interface AudioInfo {
  data: Float32Array;
  format: AudioSampleFormat;
  numberOfChannels: number;
  numberOfFrames: number;
  sampleRate: number;
  timestamp: number;
}
