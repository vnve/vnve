import * as PIXI from "pixi.js";

export class NoiseFilter extends PIXI.NoiseFilter {
  public cloneSelf() {
    return new NoiseFilter();
  }
}
