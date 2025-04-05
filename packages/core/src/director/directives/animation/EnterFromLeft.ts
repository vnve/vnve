import * as PIXI from "pixi.js";
import { AnimationDirective, AnimationDirectiveOptions } from "../base";
import { merge } from "lodash-es";

export class EnterFromLeft extends AnimationDirective {
  constructor(options: AnimationDirectiveOptions, stage: PIXI.Container) {
    super(options, stage);
    const target = this.target as PIXI.Sprite | PIXI.Text;

    if (!target) {
      return;
    }

    this.options = merge(
      {
        fromVars: {
          pixi: {
            x: target.x - target.width,
            alpha: 0,
          },
        },
        toVars: {
          pixi: {
            x: target.x ?? 0,
            alpha: target.alpha ?? 1,
          },
          ease: "power1.in",
          duration: 0.5,
        },
      },
      options,
    );
  }
}
