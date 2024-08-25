export interface ConnectorOptions {
  width: number;
  height: number;
  fps: number;
  disableAudio?: boolean;
}

export interface FrameData {
  timestamp: number;
  imageSource: CanvasImageSource;
  audioBuffers: AudioBuffer[];
}

export abstract class Connector {
  public connection: boolean;
  protected options: ConnectorOptions;

  constructor(options: ConnectorOptions) {
    this.connection = false;
    this.options = options;
  }

  public abstract send(frameData: FrameData): Promise<void>;
  public abstract finish(): Promise<Blob | undefined>;

  public connect() {
    this.connection = true;
  }
  public disconnect() {
    this.connection = false;
  }
}
