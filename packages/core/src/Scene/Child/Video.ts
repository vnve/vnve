import * as PIXI from "pixi.js";
import { Child } from "./Child";
import { applyMixins } from "./Mixin";
import { Assets } from "../../Assets";
import { cloneDeep } from "lodash-es";
import { Filter } from "..";
import { getTransformArray, reviveFilters, uuid } from "../../Utils";
import { ICreatorTickCtx } from "../../Creator";

export type VideoSource = string | PIXI.VideoResource;

export interface ISize {
  width: number;
  height: number;
}

export interface IVideoOptions {
  name?: string;
  source: VideoSource;
  /** Render video size after load */
  size?: ISize;
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

  constructor(options: IVideoOptions) {
    super();
    this.options = options;
    this.name = options.name || "";
    this.source = options.source;
    this.start = options.start ?? 0;
    this.duration = options.duration ?? 0;
    this.offset = options.offset ?? 0;
    this.loop = options.loop ?? false;
    this.volume = options.volume ?? 1;
  }

  public getVideoElement() {
    const resource = this.texture.baseTexture.resource as PIXI.VideoResource;
    const videoElement = resource.source;
    return videoElement;
  }

  public async load() {
    if (this.options.size) {
      this.width = this.options.size.width;
      this.height = this.options.size.height;
    }
    if (this.source) {
      this.texture = await Assets.load(this.source);
      const videoElement = this.getVideoElement();
      videoElement.volume = this.volume;
      this.bufferDuration = videoElement.duration * 1000;
      if (this.duration === 0) {
        this.duration = videoElement.duration * 1000;
      }
      videoElement.pause();
    }
  }

  setCurrentTime(timestamp: number) {
    return new Promise<void>((resolve) => {
      const videoElement = this.getVideoElement();
      const internalSeekedCallback = () => {
        videoElement.removeEventListener("seeked", internalSeekedCallback);
        resolve();
      };
      videoElement.addEventListener("seeked", internalSeekedCallback);
      videoElement.currentTime = timestamp;
    });
  }

  async tick(rawTimestamp: number, tickCtx: ICreatorTickCtx) {
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
      if (tickCtx.synthesizing) {
        await this.setCurrentTime(timestamp / 1000);
      } else {
        if (this.getVideoElement().paused) {
          await this.setCurrentTime(timestamp / 1000);
          this.getVideoElement().play();
        }
      }
    } else {
      if (tickCtx.synthesizing) {
        // Do nothing
      } else {
        this.getVideoElement().pause();
      }
    }
  }

  public cloneSelf() {
    const cloned = new Video(cloneDeep(this.options));

    cloned.name = this.name;
    cloned.uuid = this.uuid;
    cloned.source = this.source;
    cloned.alpha = this.alpha;
    cloned.visible = this.visible;
    cloned.width = this.width;
    cloned.height = this.height;
    cloned.setTransform(...getTransformArray(this));
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
    video.width = raw.width;
    video.height = raw.height;
    video.setTransform(...raw.transform);
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
