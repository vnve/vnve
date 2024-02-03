import * as PIXI from "pixi.js";

export class BlackMaskFilter extends PIXI.ColorMatrixFilter {
  constructor() {
    super();
    this.blackAndWhite(true);
    this.brightness(0, true);
  }

  public cloneSelf() {
    return new BlackMaskFilter();
  }

  public toJSON() {
    return {
      __type: "BlackMaskFilter",
    };
  }

  static fromJSON() {
    return new BlackMaskFilter();
  }
}
