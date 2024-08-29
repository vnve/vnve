export interface ConnectorOptions {
  width: number;
  height: number;
  fps: number;
  disableAudio?: boolean;
  videoConfig?: VideoEncoderConfig;
  audioConfig?: AudioEncoderConfig;
}

export interface FrameData {
  timestamp: number;
  imageSource: CanvasImageSource;
  audioBuffers: AudioBuffer[];
  // videoFrame & audioData only used in the worker
  videoFrame?: VideoFrame;
  audioData?: AudioData;
}

export abstract class Connector {
  public connection: boolean;
  protected options: ConnectorOptions;

  constructor(options: ConnectorOptions) {
    this.connection = false;
    this.options = options;
  }

  public abstract handle(frameData: FrameData): Promise<void>;
  public abstract finish(): Promise<Blob | ArrayBuffer | undefined>;

  public connect() {
    this.connection = true;
  }
  public disconnect() {
    this.connection = false;
  }
}
