import { Connector, ConnectorOptions, FrameData } from "./Connector";
import { wait } from "../util";
// import PreviewAudioProcessor from "./PreviewAudioProcessor?url";

export interface PreviewerOptions extends ConnectorOptions {
  canvas: HTMLCanvasElement;
}

export class Previewer extends Connector {
  protected options: PreviewerOptions;
  private context: CanvasRenderingContext2D;
  private audioContext: AudioContext;
  private audioPlayTime: number;
  private lastHandleTime: number;
  // private audioWorkletReady: Promise<void>;
  // private audioWorkletNode?: AudioWorkletNode;

  constructor(options: PreviewerOptions) {
    super(options);
    this.options = options;
    this.context = this.options.canvas.getContext("2d")!;
    this.audioContext = new AudioContext();
    this.audioPlayTime = 0;
    this.lastHandleTime = 0;
    // this.audioWorkletReady = new Promise(() => {});
    // this.initAudioWorklet(this.audioContext);
  }

  // private async initAudioWorklet(audioContext: AudioContext) {
  //   // TODO: as inline text
  //   // const url = URL.createObjectURL(
  //   //   new Blob([PreviewAudioProcessor], { type: "application/javascript" }),
  //   // );
  //   await audioContext.audioWorklet.addModule(PreviewAudioProcessor);
  //   this.audioWorkletReady = Promise.resolve();
  //   this.audioWorkletNode = new AudioWorkletNode(
  //     audioContext,
  //     "preview-audio-processor",
  //   );
  //   this.audioWorkletNode.connect(audioContext.destination);
  // }

  public async handle(frameData: FrameData) {
    const { imageSource, audioBuffers } = frameData;

    if (this.context && imageSource) {
      this.playVideoFrame(imageSource);
    }

    if (!this.options.disableAudio && audioBuffers.length > 0) {
      this.playAudioBuffers(audioBuffers);
    }

    if (this.lastHandleTime > 0) {
      const handleGap = performance.now() - this.lastHandleTime;

      await wait(1000 / this.options.fps - handleGap);
    }

    this.lastHandleTime = performance.now();
  }

  private playVideoFrame(imageSource: CanvasImageSource) {
    const canvas = this.context.canvas;
    this.context.drawImage(imageSource, 0, 0, canvas.width, canvas.height);
  }

  private playAudioBuffers(buffers: AudioBuffer[]) {
    let maxBufferTime = 0;

    for (const buffer of buffers) {
      const sourceNode = this.audioContext.createBufferSource();
      sourceNode.buffer = buffer;
      sourceNode.connect(this.audioContext.destination);

      sourceNode.onended = () => {
        sourceNode.disconnect();
      };

      sourceNode.start(this.audioPlayTime);
      maxBufferTime = Math.max(maxBufferTime, buffer.duration);
    }

    this.audioPlayTime += maxBufferTime;
  }

  public async finish() {
    this.audioContext.close();

    return undefined;
  }
}
