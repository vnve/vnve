import { Connector, ConnectorOptions, FrameData } from "./Connector";
import { audioBuffersToFloat32Arrays, wait } from "../util";
import PreviewAudioProcessor from "./PreviewAudioProcessor?url";

export interface PreviewerOptions extends ConnectorOptions {
  canvas: HTMLCanvasElement;
}

export class Previewer extends Connector {
  protected options: PreviewerOptions;
  private context: CanvasRenderingContext2D;
  private audioContext: AudioContext;
  private audioWorkletReady: Promise<void>;
  private audioWorkletNode?: AudioWorkletNode;

  constructor(options: PreviewerOptions) {
    super(options);
    this.options = options;
    this.context = this.options.canvas.getContext("2d")!;
    this.audioContext = new AudioContext();
    this.audioWorkletReady = new Promise(() => {});
    this.initAudioWorklet(this.audioContext);
  }

  private async initAudioWorklet(audioContext: AudioContext) {
    // TODO: as inline text
    // const url = URL.createObjectURL(
    //   new Blob([PreviewAudioProcessor], { type: "application/javascript" }),
    // );
    await audioContext.audioWorklet.addModule(PreviewAudioProcessor);
    this.audioWorkletReady = Promise.resolve();
    this.audioWorkletNode = new AudioWorkletNode(
      audioContext,
      "preview-audio-processor",
    );
    this.audioWorkletNode.connect(audioContext.destination);
  }

  public async playAudioBuffer(buffers: AudioBuffer[]) {
    await this.audioWorkletReady;
    if (this.audioWorkletNode) {
      const f32 = audioBuffersToFloat32Arrays(buffers);

      this.audioWorkletNode.port.postMessage({ f32 });
    }
  }

  public async handle(frameData: FrameData) {
    const { imageSource, audioBuffers } = frameData;

    if (this.context && imageSource) {
      const now = Date.now();
      const canvas = this.context.canvas;
      this.context.drawImage(imageSource, 0, 0, canvas.width, canvas.height);
      const renderTime = Date.now() - now;
      const frameDuration = 1000 / this.options.fps;
      const remainingTime = frameDuration - renderTime;

      if (remainingTime > 0) {
        await wait(remainingTime);
      }
    }

    if (!this.options.disableAudio && audioBuffers.length > 0) {
      await this.playAudioBuffer(audioBuffers);
    }
  }

  public async finish() {
    this.audioContext.close();

    return undefined;
  }
}
