/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
// https://www.w3.org/TR/webaudio/#render-quantum-size
const RENDER_QUANTUM_SIZE = 128;

class BufferController {
  constructor() {
    this.data = new Float32Array(RENDER_QUANTUM_SIZE * 1000); // 缓冲区
    this.writePointer = 0;
    this.readPointer = 0;
  }

  write(value) {
    this.data.set(value, this.writePointer);
    this.writePointer += value.length;

    if (this.writePointer >= this.data.length - value.length) {
      this.writePointer = 0;
    }
  }

  read(size = RENDER_QUANTUM_SIZE) {
    const data = this.data.slice(this.readPointer, this.readPointer + size);

    this.readPointer += size;

    if (this.readPointer >= this.data.length - size) {
      this.readPointer = 0;
    }

    return data;
  }

  ready() {
    return this.writePointer - this.readPointer >= RENDER_QUANTUM_SIZE;
  }
}

class PreviewAudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.pointer = 0;
    this.buffer = new BufferController();

    this.port.onmessage = (event) => {
      const f32Array2D = event.data.f32Array2D;

      this.buffer.write(f32Array2D);
    };
  }

  process(inputs, outputs) {
    if (this.buffer.ready()) {
      const sliced = this.buffer.read();
      outputs[0][0].set(sliced);
    }

    return true;
  }
}

registerProcessor("preview-audio-processor", PreviewAudioProcessor);
