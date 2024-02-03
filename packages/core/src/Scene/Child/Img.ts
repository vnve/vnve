import * as PIXI from "pixi.js";
import { Child } from "./Child";
import { applyMixins } from "./Mixin";
import { Assets } from "../../Assets";
import { cloneDeep } from "lodash-es";
import { Filter } from "..";
import { getTransformArray, reviveFilters, uuid } from "../../Utils";

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
      __type: "Img",
      uuid: this.uuid,
      name: this.name,
      source: Img.setSourceToDB(this.source),
      alpha: this.alpha,
      width: this.width,
      height: this.height,
      transform: getTransformArray(this),
      animationParams: this.animationParams,
      filters: this.filters,
    };
  }

  static async fromJSON(raw: any) {
    const img = new Img();

    img.uuid = raw.uuid;
    img.name = raw.name;
    if (raw.source) {
      img.source = await Img.getSourceFromDB(raw.source);
    }
    img.alpha = raw.alpha;
    img.width = raw.width;
    img.height = raw.height;
    img.setTransform(...raw.transform);
    img.animationParams = raw.animationParams;
    img.filters = reviveFilters(raw.filters);

    return img;
  }

  static setSourceToDB(source?: any) {
    return source;
  }

  static async getSourceFromDB(source: string) {
    return source;
  }
}

export interface Img extends PIXI.Sprite, Child {}
applyMixins(Img, [Child]);
