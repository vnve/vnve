import * as PIXI from "pixi.js";
import { Child } from "./Child";
import { applyMixins } from "./Mixin";
import { v4 as uuid } from "uuid";
import { cloneDeep } from "lodash-es";
import { Filter } from "..";

export class Graphics extends PIXI.Graphics {
  public uuid = uuid();
  public type = "Graphics";

  public cloneSelf() {
    const cloned = new Graphics(this.clone().geometry);

    cloned.uuid = this.uuid;
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

export interface Graphics extends PIXI.Graphics, Child {}
applyMixins(Graphics, [Child]);
