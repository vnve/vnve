import * as PIXI from "pixi.js";
import { uuid } from "../../util";
import { DisplayChild, copyFromJSON, copyTo, toJSON } from "./Child";
import { Assets, SourceStore } from "../../assets";

interface SpriteOptions {
  source: string;
}

export class Sprite extends PIXI.Sprite implements DisplayChild {
  public name: string;
  public label: string;
  public source: string;
  public assetID: number;
  public assetType: string;

  constructor(options: SpriteOptions) {
    super();
    this.name = uuid();
    this.label = "";
    this.source = options.source;
    this.assetID = 0;
    this.assetType = "";
  }

  public changeSource(source: string) {
    SourceStore.destroy(this.source);
    this.source = source;
  }

  private shouldUseCustomDimensions() {
    return (
      this.texture.width === this.width && this.texture.height === this.height
    );
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

    // 当与texture宽高一致时，说明没有自定义宽高，不复制宽高
    // 因为texture默认宽高为1,1，统一复制宽高会导致还原异常
    copyTo(this, cloned, exact, this.shouldUseCustomDimensions());

    return cloned;
  }

  public destroy() {
    SourceStore.destroy(this.source);
    super.destroy();
  }

  public toJSON() {
    return {
      ...toJSON(this, this.shouldUseCustomDimensions()),
      source: SourceStore.getID(this.source),
      assetID: this.assetID,
      assetType: this.assetType,
    };
  }

  static async fromJSON(json: AnyJSON) {
    const source = await SourceStore.getURL(json.source);
    const img = new Sprite({ source });

    img.assetID = json.assetID;
    img.assetType = json.assetType;

    await copyFromJSON(json, img);

    return img;
  }
}
