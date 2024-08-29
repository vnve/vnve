import * as PIXI from "pixi.js";
import { uuid } from "../../util";
import { DisplayChild, copyFromJSON, copyTo, toJSON } from "./Child";

export class Text extends PIXI.Text implements DisplayChild {
  public name = uuid();
  public label: string = "";

  public async load() {
    // noop
  }

  public clone() {
    const cloned = new Text(this.text, this.style.clone());

    copyTo(this, cloned);

    return cloned;
  }

  public toJSON() {
    return {
      ...toJSON(this),
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
    };
  }

  static fromJSON(json: AnyJSON) {
    const text = new Text(json.text, json.style);

    copyFromJSON(json, text);

    return text;
  }
}
