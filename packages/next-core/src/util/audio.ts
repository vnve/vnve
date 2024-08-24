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

export async function fetchUrlToAudiBuffer(url: string) {
  const arrayBuffer = await (await fetch(url)).arrayBuffer();

  const data = await arrayBufferToAudioBuffer(arrayBuffer);

  return data;
}
