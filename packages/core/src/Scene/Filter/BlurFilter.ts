import * as PIXI from "pixi.js";

export class BlurFilter extends PIXI.BlurFilter {
  public cloneSelf() {
    return new BlurFilter();
  }
}
