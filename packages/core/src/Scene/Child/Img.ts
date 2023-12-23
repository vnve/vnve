import * as PIXI from "pixi.js";
import { Child } from "./Child";
import { applyMixins } from "./Mixin";
import { v4 as uuid } from "uuid";
import { Assets } from "../../Assets";
import { cloneDeep } from "lodash-es";
import { Filter } from "..";

export type ImgSource = string | PIXI.ImageSource;

interface IImgOptions {
  name?: string;
  source: ImgSource;
}

export class Img extends PIXI.Sprite {
  public uuid = uuid();
  public type = "Img";
  public options?: IImgOptions;
  public source?: ImgSource;

  constructor(options?: IImgOptions) {
    super();
    this.options = options;
    this.name = options?.name || "";
    this.source = options?.source;
  }

  public async load() {
    if (this.source) {
      this.texture = await Assets.load(this.source);
    }
  }

  public cloneSelf() {
    const cloned = new Img(cloneDeep(this.options));

    cloned.uuid = this.uuid;
    cloned.source = this.source;
    cloned.alpha = this.alpha;
    cloned.visible = this.visible;
    cloned.width = this.width;
    cloned.height = this.height;
    cloned.pivot.copyFrom(this.pivot);
    cloned.position.copyFrom(this.position);
    cloned.skew.copyFrom(this.skew);
    cloned.scale.copyFrom(this.scale);
    cloned.rotation = this.rotation;
    cloned.animationParams = cloneDeep(this.animationParams);
    cloned.filters =
      this.filters?.map((item) => (item as Filter).cloneSelf()) || null;

    return cloned;
  }
}

export interface Img extends PIXI.Sprite, Child {}
applyMixins(Img, [Child]);
