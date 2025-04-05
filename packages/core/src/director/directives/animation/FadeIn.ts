import * as PIXI from "pixi.js";
import { AnimationDirective, AnimationDirectiveOptions } from "../base";
import { merge } from "lodash-es";

export class FadeIn extends AnimationDirective {
  constructor(options: AnimationDirectiveOptions, stage: PIXI.Container) {
    super(options, stage);

    if (!this.target) {
      return;
    }

    this.options = merge(
      {
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
      },
      options,
    );
  }
}
