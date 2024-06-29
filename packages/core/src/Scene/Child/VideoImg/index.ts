import * as PIXI from "pixi.js";
import { cloneDeep } from "lodash-es";
import log from "loglevel";
import { Assets } from "pixi.js";

import getVideoFrames from "./video-frames";

import { getTransformArray, reviveFilters, uuid } from "../../../Utils";

import { applyMixins } from "../Mixin";
import { Child } from "../Child";

import type { VideoSource, IVideoOptions } from "../Video";
import { Filter } from "../..";

export class VideoImg extends PIXI.Sprite {
  public uuid = uuid();
  public type = "VideoImg";
  public options: IVideoOptions;
  public source: VideoSource;
  public start: number;
  public duration: number;
  public offset: number;
  public loop = true;
  public bufferDuration = 0;
  public seekedTime = 0;
  public canvas: HTMLCanvasElement;
  public frameBlobUrls: string[] = [];

  constructor(options: IVideoOptions) {
    super();
    this.options = options;
    this.name = options.name || "";
    this.source = options.source;
    this.start = options.start ?? 0;
    this.duration = options.duration ?? 0;
    this.offset = options.offset ?? 0;
    this.loop = options.loop ?? true;
    this.canvas = document.createElement("canvas");
  }

  public getFrameImageSource(index: number) {
    const url = this.frameBlobUrls[index];
    return url;
  }

  public getFrameImageSourceAsset(index: number) {
    return {
      src: this.getFrameImageSource(index),
      format: "png",
      loadParser: "loadTextures",
    };
  }

  public async load() {
    const start = Date.now();
    log.debug("get video frames start", this.source);

    await getVideoFrames({
      videoUrl: this.source,
      onFrame: (frame: VideoFrame) => {
        const ctx = this.canvas.getContext("2d");
        ctx?.drawImage(frame, 0, 0, frame.codedWidth, frame.codedHeight);

        // Extract the image data from the canvas
        this.canvas.toBlob((blob) => {
          if (blob) {
            this.frameBlobUrls.push(URL.createObjectURL(blob));
          }
        });

        frame.close();
      },
      onConfig: (config: {
        codec: string;
        codedWidth: number;
        codedHeight: number;
        description: Uint8Array;
        info: { duration: number };
        mp4boxFile: any;
      }) => {
        this.canvas.width = config.codedWidth;
        this.canvas.height = config.codedHeight;
        this.bufferDuration = config.info.duration;
      },
    });
    log.debug(`get video frames end [${Date.now() - start}ms]`, this.source);

    if (this.options.name) {
      this.name = this.options.name;
    }
    if (this.options.size) {
      this.width = this.options.size.width;
      this.height = this.options.size.height;
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
      const index = Math.floor(
        (timestamp / this.duration) * this.frameBlobUrls.length,
      );

      const unload = async () => {
        if (index > 0) {
          await Assets.unload(this.getFrameImageSourceAsset(index - 1));
        }
      };
      const load = async () => {
        this.texture = await Assets.load(this.getFrameImageSourceAsset(index));
      };
      await Promise.all([unload(), load()]);
    } else {
      this.texture.baseTexture.destroy();
    }
  }

  public cloneSelf() {
    const cloned = new VideoImg(cloneDeep(this.options));

    cloned.name = this.name;
    cloned.uuid = this.uuid;
    cloned.source = this.source;
    cloned.start = this.start;
    cloned.duration = this.duration;
    cloned.loop = this.loop;
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
      __type: "VideoImg",
      uuid: this.uuid,
      options: this.options,
      name: this.name,
      source: VideoImg.setSourceToDB(this.source),
      loop: this.loop,
      alpha: this.alpha,
      width: this.width,
      height: this.height,
      transform: getTransformArray(this),
      animationParams: this.animationParams,
      filters: this.filters,
    };
  }

  static async fromJSON(raw: any) {
    const video = new VideoImg(raw.options);

    video.uuid = raw.uuid;
    video.name = raw.name;
    if (raw.source) {
      video.source = await VideoImg.getSourceFromDB(raw.source);
    }
    video.alpha = raw.alpha;
    video.loop = raw.loop;
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

export interface VideoImg extends PIXI.Sprite, Child {}
applyMixins(VideoImg, [Child]);
