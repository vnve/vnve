/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck

class PreviewAudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.data = [];
    this.port.onmessage = (event) => {
      const f32 = event.data.f32;
      // TODO: 等分成128大小的多个数组，每次只处理一部分
      const sliced = splitFloat32ArrayArray(f32);

      this.data.push(...sliced);
    };
  }

  process(inputs, outputs) {
    if (this.data && this.data.length > 0) {
      const output = outputs[0];
      const data = this.data.shift();

      for (let channel = 0; channel < output.length; channel++) {
        output[channel].set(data[0][channel]);
      }
    }
    return true;
  }
}

// [
//   [ Float32Array, Float32Array ]
// ]
// function splitFloat32ArrayArray(inputs) {
//   const outputs = [[new Float32Array(128), new Float32Array(128)]];
//   const output = outputs[0];
//   const input = inputs[0];
// }

registerProcessor("preview-audio-processor", PreviewAudioProcessor);
