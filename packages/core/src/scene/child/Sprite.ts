import * as PIXI from "pixi.js";
import { uuid } from "../../util";
import {
  DisplayChild,
  copyFromJSON,
  copyTo,
  shouldIgnoreWH,
  toJSON,
} from "./Child";
import { Assets } from "../../assets";

interface SpriteOptions {
  source: string;
}

export class Sprite extends PIXI.Sprite implements DisplayChild {
  public name: string;
  public label: string;
  public type: string;
  public source: string;
  public assetID: number;
  public assetType: string;

  constructor(options: SpriteOptions) {
    super();
    this.name = uuid();
    this.label = "";
    this.type = "Sprite";
    this.source = options.source;
    this.assetID = 0;
    this.assetType = "";
  }

  public changeSource(source: string) {
    this.source = source;
  }

  public async load() {
    if (this.source) {
      this.texture = await Assets.load(this.source);
    }
  }

  public clone(exact = false) {
    const cloned = new Sprite({ source: this.source });

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
    const img = new Sprite({ source: json.source });

    img.assetID = json.assetID;
    img.assetType = json.assetType;

    await copyFromJSON(json, img);

    return img;
  }
}
