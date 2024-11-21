import { Sprite, Ticker, Texture, UPDATE_PRIORITY } from "pixi.js";
import {
  DisplayChild,
  copyFromJSON,
  copyTo,
  shouldIgnoreWH,
  toJSON,
} from "./Child";
import { VideoRenderer } from "../../lib/VideoRenderer";
import { uuid } from "../../util";

export interface IVideoOptions {
  source: string;
  width?: number;
  height?: number;
  start?: number;
  duration?: number;
  /** Play after offset mileseconds */
  offset?: number;
  loop?: boolean;
  volume?: number;
}

export class Video extends Sprite implements DisplayChild {
  public name: string;
  public label: string;
  public type: string;
  public source: string;
  public assetID: number;
  public assetType: string;
  public start: number;
  public duration: number;
  public offset: number;
  public loop: boolean;
  public volume: number;
  public bufferDuration = 0;
  public options: IVideoOptions;

  private videoRenderer?: VideoRenderer;
  private _isConnectedToTicker = false;

  constructor(options: IVideoOptions) {
    super();
    this.options = options;
    this.name = uuid();
    this.label = "";
    this.type = "Video";
    this.source = options.source;
    this.assetID = 0;
    this.assetType = "";
    this.width = this.options.width ?? 0;
    this.height = this.options.height ?? 0;
    this.start = options.start ?? 0;
    this.duration = options.duration ?? 0;
    this.offset = options.offset ?? 0;
    this.loop = options.loop ?? false;
    this.volume = options.volume ?? 1;
  }

  public async load() {
    if (this.source) {
      const fileURL = this.source;

      // load video
      const textureCanvas = document.createElement("canvas");
      const textureContext = textureCanvas.getContext(
        "2d",
      ) as CanvasRenderingContext2D;
      const videoRenderer = new VideoRenderer();
      await videoRenderer.initialize(fileURL, textureContext, {
        width: this.width,
        height: this.height,
      });

      this.width = videoRenderer.width;
      this.height = videoRenderer.height;
      const bufferDuration = videoRenderer.duration * 1000;
      this.duration = this.duration || bufferDuration;
      this.bufferDuration = bufferDuration;

      this.videoRenderer = videoRenderer;
      this.texture = Texture.from(textureCanvas);

      // default render zero frame
      this.videoRenderer.render(0);
      this.texture.update();
    }
  }

  public play() {
    if (!this._isConnectedToTicker) {
      Ticker.shared.add(this.update, this, UPDATE_PRIORITY.HIGH);
      this._isConnectedToTicker = true;
    }
  }

  public stop() {
    if (this._isConnectedToTicker) {
      Ticker.shared.remove(this.update, this);
      this._isConnectedToTicker = false;
    }
  }

  destroy(): void {
    this.stop();
    super.destroy(true);

    this.videoRenderer = undefined;
  }

  async update() {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const timestamp = Ticker.shared.time * 1000;

    this.videoRenderer?.render(timestamp * 1000);
    this.texture.update();
  }

  public clone(exact = false) {
    const cloned = new Video({ source: this.source });

    cloned.assetID = this.assetID;
    cloned.assetType = this.assetType;

    copyTo(this, cloned, exact, shouldIgnoreWH(this));

    return cloned;
  }

  public toJSON() {
    return {
      ...toJSON(this, shouldIgnoreWH(this)),
      source: this.source,
      assetID: this.assetID,
      assetType: this.assetType,
    };
  }

  static async fromJSON(json: AnyJSON) {
    const video = new Video({ source: json.source });

    video.assetID = json.assetID;
    video.assetType = json.assetType;

    await copyFromJSON(json, video);

    return video;
  }
}
