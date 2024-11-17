import { wait } from "../util";
import { Connector, ConnectorOptions, FrameData } from "./Connector";

export interface PreviewerOptions extends ConnectorOptions {
  canvas: HTMLCanvasElement;
}

export class Previewer extends Connector {
  protected declare options: PreviewerOptions;
  private context: CanvasRenderingContext2D;
  private audioContext: AudioContext | null;
  private audioPlayTime: number;
  private lastHandleTime: number;

  constructor(options: PreviewerOptions) {
    super(options);
    this.options = options;
    this.audioContext = options.disableAudio ? null : new AudioContext();
    this.audioPlayTime = 0;
    this.lastHandleTime = 0;

    const { canvas, width, height } = this.options;
    canvas.width = width;
    canvas.height = height;
    this.context = canvas.getContext("2d")!;
  }

  public async handle(frameData: FrameData) {
    const { imageSource, audioBuffers } = frameData;
    const handleTime = performance.now();
    const handleGap =
      this.lastHandleTime > 0 ? handleTime - this.lastHandleTime : 0;

    if (!this.options.disableAudio) {
      this.playAudioBuffers(audioBuffers);
    }

    if (this.context && imageSource) {
      this.playVideoFrame(imageSource);
    }

    // TODO: perf
    // 因为handle循环本身存在间隔时长, 需要减去间隔, 否则会导致加入的sourceNode在currentTime后面
    // 同时，需要预留一定时间给调度，默认先写死4ms
    await wait(1000 / this.options.fps - handleGap - 4);

    this.lastHandleTime = performance.now();
  }

  private playVideoFrame(imageSource: CanvasImageSource) {
    const { width, height } = this.options;

    this.context.drawImage(imageSource, 0, 0, width, height);
  }

  private playAudioBuffers(buffers: AudioBuffer[]) {
    if (buffers.length === 0) {
      return;
    }

    if (!this.audioContext) {
      return;
    }

    let bufferDuration = 0;
    // 创建时，currentTime就开始计算，首次需要校准
    // 确保加入的sourceNode在currentTime后面
    if (this.audioContext.currentTime > this.audioPlayTime) {
      this.audioPlayTime = this.audioContext.currentTime;
    }

    for (const buffer of buffers) {
      const sourceNode = this.audioContext.createBufferSource();
      sourceNode.buffer = buffer;
      sourceNode.connect(this.audioContext.destination);

      sourceNode.onended = () => {
        sourceNode.disconnect();
      };

      sourceNode.start(this.audioPlayTime);
      bufferDuration = Math.max(bufferDuration, buffer.duration);
    }

    this.audioPlayTime += bufferDuration;
  }

  public async finish() {
    this.audioContext?.close();

    return undefined;
  }
}
