export interface Float32ArrayAudioInfo {
  float32Array: Float32Array;
  numberOfChannels: number;
  length: number;
  sampleRate: number;
}

export async function sliceAudioBuffer(
  audioBuffer: AudioBuffer,
  timestamp: number,
  fps: number,
  volume?: number,
) {
  const sampleRate = audioBuffer.sampleRate;
  const numberOfChannels = audioBuffer.numberOfChannels;
  const startOffset = Math.floor((timestamp / 1000) * sampleRate);
  const numberOfFrames = sampleRate * (1 / fps);
  const offlineAudioContext = new OfflineAudioContext(
    numberOfChannels,
    numberOfFrames,
    sampleRate,
  );
  let audioBufferSlice: AudioBuffer = offlineAudioContext.createBuffer(
    numberOfChannels,
    numberOfFrames,
    sampleRate,
  );

  const f32ArraySlice = new Float32Array(numberOfFrames);

  for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
    audioBuffer.copyFromChannel(f32ArraySlice, channel, startOffset);
    audioBufferSlice.copyToChannel(f32ArraySlice, channel);
  }

  if (typeof volume !== "undefined") {
    const sourceNode = offlineAudioContext.createBufferSource();
    sourceNode.buffer = audioBufferSlice;
    const gainNode = offlineAudioContext.createGain();

    gainNode.gain.value = volume;
    sourceNode.connect(gainNode);
    gainNode.connect(offlineAudioContext.destination);
    sourceNode.start();
    audioBufferSlice = await offlineAudioContext.startRendering();
  }

  return audioBufferSlice;
}

export async function sliceFloat32Array(
  audioBuffer: AudioBuffer,
  timestamp: number,
  fps: number,
  volume?: number,
) {
  const slicedAudioBuffer = await sliceAudioBuffer(
    audioBuffer,
    timestamp,
    fps,
    volume,
  );

  return audioBufferToFloat32Array(slicedAudioBuffer);
}

export async function arrayBufferToAudioBuffer(
  arrayBuffer: ArrayBuffer,
  sampleRate = 44100,
): Promise<AudioBuffer> {
  return new Promise((resolve, reject) => {
    const audioContext = new AudioContext({
      sampleRate,
    });

    audioContext.decodeAudioData(arrayBuffer, resolve, reject).finally(() => {
      audioContext.close();
    });
  });
}

export function audioBufferToFloat32Array(
  audioBuffer: AudioBuffer,
): Float32ArrayAudioInfo {
  const numberOfChannels = audioBuffer.numberOfChannels;
  const length = audioBuffer.length;
  const sampleRate = audioBuffer.sampleRate;
  const float32Array = new Float32Array(numberOfChannels * length);

  for (let channel = 0; channel < numberOfChannels; channel++) {
    float32Array.set(audioBuffer.getChannelData(channel), channel * length);
  }

  return {
    float32Array: float32Array,
    numberOfChannels: numberOfChannels,
    length: length,
    sampleRate: sampleRate,
  };
}

export function float32ArrayToAudioBuffer({
  float32Array,
  numberOfChannels,
  length,
  sampleRate,
}: Float32ArrayAudioInfo): AudioBuffer {
  const audioBuffer = new AudioBuffer({
    length,
    numberOfChannels,
    sampleRate,
  });

  for (let channel = 0; channel < numberOfChannels; channel++) {
    const channelData = float32Array.subarray(
      channel * length,
      (channel + 1) * length,
    );
    audioBuffer.copyToChannel(channelData, channel);
  }

  return audioBuffer;
}

export async function fetchUrlToAudiBuffer(url: string) {
  const arrayBuffer = await (await fetch(url)).arrayBuffer();

  const data = await arrayBufferToAudioBuffer(arrayBuffer);

  return data;
}
