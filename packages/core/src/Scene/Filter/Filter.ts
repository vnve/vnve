import * as PIXI from "pixi.js";

export class Filter extends PIXI.Filter {
  public cloneSelf() {
    return new Filter();
  }
}
