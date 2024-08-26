import { Connector, ConnectorOptions, FrameData } from "./Connector";
import { wait } from "../util";

export interface PreviewerOptions extends ConnectorOptions {
  canvas: HTMLCanvasElement;
}

export class Previewer extends Connector {
  protected options: PreviewerOptions;
  private context: CanvasRenderingContext2D;

  constructor(options: PreviewerOptions) {
    super(options);
    this.options = options;
    this.context = this.options.canvas.getContext("2d")!;
  }

  public async handle(frameData: FrameData) {
    const { imageSource, audioInfos: audioBuffers } = frameData;

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

    if (!this.options.disableAudio && audioBuffers) {
      // TODO:
    }
  }

  public async finish() {
    return undefined;
  }
}
