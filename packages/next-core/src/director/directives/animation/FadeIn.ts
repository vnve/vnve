import * as PIXI from "pixi.js";
import { AnimationDirective, AnimationDirectiveOptions } from "../base";

export class FadeIn extends AnimationDirective {
  constructor(options: AnimationDirectiveOptions, stage: PIXI.Container) {
    super(options, stage);
    this.options = {
      fromVars: {
        pixi: {
          alpha: 0,
        },
      },
      toVars: {
        pixi: {
          alpha: this.target.alpha ?? 1,
        },
        ease: "power1.in",
        duration: 0.5,
      },
      ...options,
    };
  }
}
