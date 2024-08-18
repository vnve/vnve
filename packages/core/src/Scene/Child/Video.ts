import * as PIXI from "pixi.js";
import { Child } from "./Child";
import { applyMixins } from "./Mixin";
import { cloneDeep } from "lodash-es";
import { Filter } from "..";
import { getTransformArray, reviveFilters, uuid } from "../../Utils";
import { VideoRenderer } from "../../Lib/VideoRenderer";

export type VideoSource = string; // TODO: support File type

export interface IVideoOptions {
  name?: string;
  source: VideoSource;
  width?: number;
  height?: number;
  start?: number;
  duration?: number;
  /** Play after offset mileseconds */
  offset?: number;
  loop?: boolean;
  volume?: number;
}

export class Video extends PIXI.Sprite {
  public uuid = uuid();
  public type = "Video";
  public options: IVideoOptions;
  public source: VideoSource;
  public start: number;
  public duration: number;
  public offset: number;
  public loop: boolean;
  public volume: number;
  public bufferDuration = 0;

  private videoRenderer!: VideoRenderer;

  constructor(options: IVideoOptions) {
    super();
    this.options = options;
    this.name = options.name || "";
    this.source = options.source;
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
      this.texture = PIXI.Texture.from(textureCanvas);

      // default render zero frame
      this.videoRenderer.render(0);
      this.texture.update();
    }
  }

  async tick(rawTimestamp: number) {
    let timestamp = rawTimestamp - this.offset;

    if (timestamp < 0) {
      return;
    }

    if (
      this.loop &&
      this.start + this.duration > this.bufferDuration &&
      timestamp > this.start + this.bufferDuration
    ) {
      timestamp = timestamp % (this.start + this.bufferDuration);
    }

    if (timestamp >= this.start && timestamp <= this.start + this.duration) {
      this.videoRenderer.render(timestamp * 1000);
      this.texture.update();
    }
  }

  public cloneSelf() {
    const cloned = new Video(cloneDeep(this.options));

    cloned.name = this.name;
    cloned.uuid = this.uuid;
    cloned.source = this.source;
    cloned.start = this.start;
    cloned.duration = this.duration;
    cloned.offset = this.offset;
    cloned.loop = this.loop;
    cloned.volume = this.volume;
    cloned.alpha = this.alpha;
    cloned.visible = this.visible;
    cloned.setTransform(...getTransformArray(this));
    cloned.width = this.width;
    cloned.height = this.height;
    cloned.animationParams = cloneDeep(this.animationParams);
    cloned.filters =
      this.filters?.map((item) => (item as Filter).cloneSelf()) || null;

    return cloned;
  }

  public destroy() {
    if (typeof this.source === "string" && this.source.startsWith("blob:")) {
      URL.revokeObjectURL(this.source);
    }
    super.destroy();
  }

  public toJSON() {
    return {
      __type: "Video",
      options: this.options,
      uuid: this.uuid,
      name: this.name,
      source: Video.setSourceToDB(this.source),
      alpha: this.alpha,
      width: this.width,
      height: this.height,
      transform: getTransformArray(this),
      animationParams: this.animationParams,
      filters: this.filters,
    };
  }

  static async fromJSON(raw: any) {
    const video = new Video(raw.options);

    video.uuid = raw.uuid;
    video.name = raw.name;
    if (raw.source) {
      video.source = await Video.getSourceFromDB(raw.source);
    }
    video.alpha = raw.alpha;
    video.setTransform(...raw.transform);
    video.width = raw.width;
    video.height = raw.height;
    video.animationParams = raw.animationParams;
    video.filters = reviveFilters(raw.filters);

    return video;
  }

  static setSourceToDB(source?: any) {
    return source;
  }

  static async getSourceFromDB(source: string) {
    return source;
  }
}

export interface Video extends PIXI.Sprite, Child {}
applyMixins(Video, [Child]);
