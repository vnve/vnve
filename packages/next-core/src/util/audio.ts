/**
 * Slices a portion of an AudioBuffer
 * @param audioBuffer The original AudioBuffer to slice.
 * @param start The start time in seconds for the slice.
 * @param duration The duration of the slice in seconds.
 * @param volume Optional volume adjustment 0-1
 * @returns AudioBuffer
 */
export async function sliceAudioBuffer(
  audioBuffer: AudioBuffer,
  start: number,
  duration: number,
  volume?: number,
) {
  const sampleRate = audioBuffer.sampleRate;
  const numberOfChannels = audioBuffer.numberOfChannels;
  const startOffset = Math.floor(start * sampleRate);
  const numberOfFrames = sampleRate * duration;
  const offlineAudioContext = new OfflineAudioContext(
    numberOfChannels,
    numberOfFrames,
    sampleRate,
  );
  let slicedAudioBuffer: AudioBuffer = offlineAudioContext.createBuffer(
    numberOfChannels,
    numberOfFrames,
    sampleRate,
  );

  const slicedF32Array = new Float32Array(numberOfFrames);

  for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
    audioBuffer.copyFromChannel(slicedF32Array, channel, startOffset);
    slicedAudioBuffer.copyToChannel(slicedF32Array, channel);
  }

  if (typeof volume !== "undefined") {
    const sourceNode = offlineAudioContext.createBufferSource();
    sourceNode.buffer = slicedAudioBuffer;
    const gainNode = offlineAudioContext.createGain();

    gainNode.gain.value = volume;
    sourceNode.connect(gainNode);
    gainNode.connect(offlineAudioContext.destination);
    sourceNode.start();
    slicedAudioBuffer = await offlineAudioContext.startRendering();
  }

  return slicedAudioBuffer;
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

export async function fetchAudioBuffer(url: string) {
  const arrayBuffer = await (await fetch(url)).arrayBuffer();

  const data = await arrayBufferToAudioBuffer(arrayBuffer);

  return data;
}
