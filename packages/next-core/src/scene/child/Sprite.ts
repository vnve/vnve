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

  constructor(options: SpriteOptions) {
    super();
    this.name = uuid();
    this.label = "";
    this.source = options.source;
  }

  public async load() {
    if (this.source) {
      this.texture = await Assets.load(this.source);
    }
  }

  public clone(exact = false) {
    const cloned = new Sprite({ source: this.source });

    copyTo(this, cloned, exact); // TODO: 为什么复制宽高导致异常

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
      ...toJSON(this),
      source: SourceStore.set(this.source),
    };
  }

  static async fromJSON(json: AnyJSON) {
    const source = await SourceStore.get(json.source);
    const img = new Sprite({ source });

    await copyFromJSON(json, img);

    return img;
  }
}
