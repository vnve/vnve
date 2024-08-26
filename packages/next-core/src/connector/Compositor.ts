import { Connector, ConnectorOptions, FrameData } from "./Connector";
import CompositorWorker from "./Compositor.worker?worker&inline";

export enum CompositorWorkerMessageType {
  LOADED = "loaded",
  INIT = "init",
  SEND = "send",
  FINISH = "finish",
}

/**
 * WebCodecs Video Compositor
 */
export class Compositor extends Connector {
  private compositorWorker: Worker;
  private initialized: Promise<void>;

  constructor(options: ConnectorOptions) {
    super(options);
    this.compositorWorker = new CompositorWorker();
    this.initialized = new Promise((resolve, reject) => {
      this.compositorWorker.addEventListener("message", (event) => {
        const { type } = event.data;

        if (type === CompositorWorkerMessageType.LOADED) {
          this.getFromWorker(CompositorWorkerMessageType.INIT, options)
            .then(() => {
              resolve();
            })
            .catch((e) => {
              reject(e);
            });
        }
      });
    });
  }

  getFromWorker<T>(
    type: CompositorWorkerMessageType,
    msgData?: ConnectorOptions | FrameData,
    transfer?: Transferable[],
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const msgListener = ({ data }: MessageEvent) => {
        if (data.type === type) {
          if (data.errMsg) {
            reject(data.errMsg);
          } else {
            resolve(data.result);
          }
          this.compositorWorker.removeEventListener("message", msgListener);
        }
      };

      this.compositorWorker.addEventListener("message", msgListener);
      this.compositorWorker.postMessage(
        {
          type,
          data: msgData,
        },
        transfer ? transfer : [],
      );
    });
  }

  public async handle(frameData: FrameData): Promise<void> {
    await this.initialized;

    const videoFrame = new VideoFrame(frameData.imageSource, {
      timestamp: frameData.timestamp * 1000,
    });
    frameData.imageSource = videoFrame;

    return this.getFromWorker(CompositorWorkerMessageType.SEND, frameData, [
      frameData.imageSource,
      ...(frameData.audioInfos?.map((item) => item.float32Array) ?? []),
    ]) as Promise<void>;
  }

  public async finish() {
    await this.initialized;
    const buffer = (await this.getFromWorker(
      CompositorWorkerMessageType.FINISH,
    )) as ArrayBuffer;

    if (buffer) {
      return new Blob([buffer], { type: "video/mp4" });
    }
  }
}
