import { wait } from "../util";
import { Connector, ConnectorOptions, FrameData } from "./Connector";

export interface PreviewerOptions extends ConnectorOptions {
  canvas: HTMLCanvasElement;
}

export class Previewer extends Connector {
  protected declare options: PreviewerOptions;
  private context: CanvasRenderingContext2D;
  private audioContext?: AudioContext;
  private audioPlayTime: number;
  private currentTime: number;
  private frameId: number;
  private frameWaitPromise?: Promise<void>;
  private frameWaitResolve?: () => void;

  constructor(options: PreviewerOptions) {
    super(options);
    this.options = options;
    this.audioPlayTime = 0;

    const { canvas, width, height } = this.options;
    canvas.width = width;
    canvas.height = height;
    this.context = canvas.getContext("2d")!;
    this.currentTime = 0;
    this.frameId = 0;
  }

  public async handle(frameData: FrameData) {
    const { imageSource, audioBuffers, timestamp } = frameData;

    this.currentTime = timestamp / 1000;

    if (this.options.disableAudio) {
      if (this.context && imageSource) {
        this.playVideoFrame(imageSource);
      }
      // 禁用音频时，直接模拟间隔时间
      await wait(1000 / this.options.fps);
    } else {
      if (!this.audioContext) {
        this.audioContext = new AudioContext();
      }

      if (!this.frameId) {
        this.frameWaitPromise = new Promise((resolve) => {
          this.frameWaitResolve = resolve;
        });
        this.frameId = requestAnimationFrame(() => this.frameCallback());
      }

      this.playAudioBuffers(audioBuffers);

      // 使用音频时，优先按照音频时间轴，播放到指定时间点时，渲染对应的视频帧
      await this.frameWaitPromise;

      if (this.context && imageSource) {
        this.playVideoFrame(imageSource);
      }
    }
  }

  private frameCallback() {
    if (this.audioContext) {
      // 音频播放时间超过当前需要展示的帧时间，触发下一帧渲染
      if (this.audioContext.currentTime >= this.currentTime) {
        this.frameWaitResolve?.();
        this.frameWaitPromise = new Promise((resolve) => {
          this.frameWaitResolve = resolve;
        });
      }
      this.frameId = requestAnimationFrame(() => this.frameCallback());
    }
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
    if (this.frameId) {
      cancelAnimationFrame(this.frameId);
    }
    this.frameWaitPromise = undefined;
    this.frameWaitResolve = undefined;

    return undefined;
  }
}
