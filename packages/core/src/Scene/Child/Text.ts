import * as PIXI from "pixi.js";
import { Child } from "./Child";
import { applyMixins } from "./Mixin";
import { cloneDeep } from "lodash-es";
import { Filter } from "..";
import { getTransformArray, reviveFilters, uuid } from "../../Utils";

export class Text extends PIXI.Text {
  public uuid = uuid();
  public type = "Text";

  public cloneSelf() {
    const cloned = new Text(this.text, cloneDeep(this.style));

    cloned.name = this.name;
    cloned.uuid = this.uuid;
    cloned.alpha = this.alpha;
    cloned.visible = this.visible;
    cloned.setTransform(...getTransformArray(this));
    cloned.animationParams = cloneDeep(this.animationParams);
    cloned.filters =
      this.filters?.map((item) => (item as Filter).cloneSelf()) || null;

    return cloned;
  }

  public toJSON() {
    return {
      __type: "Text",
      name: this.name,
      uuid: this.uuid,
      text: this.text,
      style: {
        fontSize: this.style.fontSize,
        fontWeight: this.style.fontWeight,
        fontStyle: this.style.fontStyle,
        fontFamily: this.style.fontFamily,
        fill: this.style.fill,
        wordWrap: this.style.wordWrap,
        breakWords: this.style.breakWords,
        wordWrapWidth: this.style.wordWrapWidth,
        leading: this.style.leading,
      },
      alpha: this.alpha,
      width: this.width,
      height: this.height,
      transform: getTransformArray(this),
      animationParams: this.animationParams,
      filters: this.filters,
    };
  }

  static fromJSON(raw: any) {
    const text = new Text(raw.text, raw.style);

    text.name = raw.name;
    text.uuid = raw.uuid;
    text.alpha = raw.alpha;
    text.width = raw.width;
    text.height = raw.height;
    text.setTransform(...raw.transform);
    text.animationParams = raw.animationParams;
    text.filters = reviveFilters(raw.filters);

    return text;
  }
}

export interface Text extends PIXI.Text, Child {}
applyMixins(Text, [Child]);
