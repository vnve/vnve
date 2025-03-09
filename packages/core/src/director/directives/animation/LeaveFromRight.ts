import * as PIXI from "pixi.js";
import { AnimationDirective, AnimationDirectiveOptions } from "../base";
import { merge } from "lodash-es";

export class LeaveFromRight extends AnimationDirective {
  constructor(options: AnimationDirectiveOptions, stage: PIXI.Container) {
    super(options, stage);
    const target = this.target as PIXI.Sprite | PIXI.Text;

    if (!target) {
      return;
    }

    this.options = merge(
      {
        toVars: {
          pixi: {
            x: target.x + target.width,
            alpha: 0,
          },
          ease: "power1.in",
          duration: 0.5,
        },
      },
      options,
    );
  }
}
