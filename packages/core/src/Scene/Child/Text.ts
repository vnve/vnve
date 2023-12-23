import * as PIXI from "pixi.js";
import { Child } from "./Child";
import { applyMixins } from "./Mixin";
import { v4 as uuid } from "uuid";
import { cloneDeep } from "lodash-es";
import { Filter } from "..";

export class Text extends PIXI.Text {
  public uuid = uuid();
  public type = "Text";

  public cloneSelf() {
    const cloned = new Text(this.text, cloneDeep(this.style));

    cloned.uuid = this.uuid;
    cloned.alpha = this.alpha;
    cloned.visible = this.visible;
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

export interface Text extends PIXI.Text, Child {}
applyMixins(Text, [Child]);
