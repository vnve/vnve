import * as PIXI from "pixi.js";
import { AnimationDirective, AnimationDirectiveOptions } from "../base";

export class Show extends AnimationDirective {
  constructor(options: AnimationDirectiveOptions, stage: PIXI.Container) {
    super(options, stage);
    this.options = {
      toVars: {
        pixi: {
          visible: true,
        },
        ease: "none",
        duration: 0,
      },
      ...options,
    };
  }
}
