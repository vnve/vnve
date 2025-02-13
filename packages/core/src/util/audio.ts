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
  try {
    const arrayBuffer = await (await fetch(url)).arrayBuffer();

    const data = await arrayBufferToAudioBuffer(arrayBuffer);

    return data;
  } catch (error) {
    console.error("fetchAudioBuffer error:", error);

    return;
  }
}

// export function mixAudioBuffers(buffers: AudioBuffer[]) {
//   const audioContext = new AudioContext();
//   // 计算目标AudioBuffer的长度
//   const length = Math.max(...buffers.map((buffer) => buffer.length));

//   // 创建新的AudioBuffer，采样率和通道数取第一个buffer的值
//   const mixedBuffer = audioContext.createBuffer(
//     buffers[0].numberOfChannels,
//     length,
//     buffers[0].sampleRate,
//   );

//   // 混合每个通道的数据
//   for (let channel = 0; channel < mixedBuffer.numberOfChannels; channel++) {
//     const mixedChannelData = mixedBuffer.getChannelData(channel);

//     // 初始化outputData为0
//     mixedChannelData.fill(0);

//     // 叠加每个buffer的数据
//     buffers.forEach((buffer) => {
//       const inputData = buffer.getChannelData(channel);
//       for (let i = 0; i < length; i++) {
//         mixedChannelData[i] += i < inputData.length ? inputData[i] : 0;
//       }
//     });
//   }

//   audioContext.close();

//   return mixedBuffer;
// }

// export async function mixAudioBuffers(buffers: AudioBuffer[]) {
//   // 计算目标AudioBuffer的长度
//   const length = Math.max(...buffers.map((buffer) => buffer.length));

//   // 使用第一个buffer的采样率和通道数创建OfflineAudioContext
//   const offlineContext = new OfflineAudioContext(
//     buffers[0].numberOfChannels,
//     length,
//     buffers[0].sampleRate,
//   );

//   // 创建混合用的AudioBufferSourceNode并连接到OfflineAudioContext的destination
//   buffers.forEach((buffer) => {
//     const bufferSource = offlineContext.createBufferSource();
//     bufferSource.buffer = buffer;
//     bufferSource.connect(offlineContext.destination);
//     bufferSource.start();
//   });

//   // 渲染音频数据
//   const mixedBuffer = await offlineContext.startRendering();

//   return mixedBuffer;
// }

export function audioBuffersToFloat32Array2D(audioBuffers: AudioBuffer[]) {
  const outputs: Float32Array[][] = [];

  for (let i = 0; i < audioBuffers.length; i++) {
    const audioBuffer = audioBuffers[i];
    const numberOfChannels = audioBuffer.numberOfChannels;

    // 初始化输出的每个节点
    outputs[i] = [];
    for (let channel = 0; channel < numberOfChannels; channel++) {
      // 获取每个通道的音频数据
      const channelData = audioBuffer.getChannelData(channel);

      // 创建一个新的 Float32Array 用于 outputs
      const outputChannelData = new Float32Array(channelData.length);

      outputChannelData.set(channelData);

      outputs[i][channel] = outputChannelData;
    }
  }

  return outputs;
}
