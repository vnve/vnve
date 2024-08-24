import * as PIXI from "pixi.js";
import { AnimationDirective, AnimationDirectiveOptions } from "../base";

export class Show extends AnimationDirective {
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
          alpha: 1,
        },
        ease: "none",
        duration: 0,
      },
      ...options,
    };
  }
}
