import * as PIXI from "pixi.js";
import { AnimationDirective, AnimationDirectiveOptions } from "../base";

export class Hide extends AnimationDirective {
  constructor(options: AnimationDirectiveOptions, stage: PIXI.Container) {
    super(options, stage);
    this.options = {
      toVars: {
        pixi: {
          alpha: 0,
        },
        ease: "none",
        duration: 0,
      },
      ...options,
    };
  }
}
