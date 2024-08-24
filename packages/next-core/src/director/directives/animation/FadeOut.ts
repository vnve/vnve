import * as PIXI from "pixi.js";
import { AnimationDirective, AnimationDirectiveOptions } from "../base";

export class FadeOut extends AnimationDirective {
  constructor(options: AnimationDirectiveOptions, stage: PIXI.Container) {
    super(options, stage);
    this.options = {
      toVars: {
        pixi: {
          alpha: 0,
        },
        ease: "power1.in",
        duration: 0.5,
      },
      ...options,
    };
  }
}
