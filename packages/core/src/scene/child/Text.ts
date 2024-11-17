import * as PIXI from "pixi.js";
import { uuid } from "../../util";
import { DisplayChild, copyFromJSON, copyTo, toJSON } from "./Child";

export class Text extends PIXI.Text implements DisplayChild {
  public name = uuid();
  public label = "";
  public type = "Text";
  public disableTextEdit = false;

  public async load() {
    // noop
  }

  public clone(exact = false) {
    const cloned = new Text(this.text, this.style.clone());

    // 文本元素不能复制宽、高
    copyTo(this, cloned, exact, true);

    cloned.disableTextEdit = this.disableTextEdit;

    return cloned;
  }

  public toJSON() {
    return {
      ...toJSON(this, true),
      text: this.text,
      disableTextEdit: this.disableTextEdit,
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

  static async fromJSON(json: AnyJSON) {
    const text = new Text(json.text, json.style);

    await copyFromJSON(json, text, true);

    text.disableTextEdit = json.disableTextEdit;

    return text;
  }
}
