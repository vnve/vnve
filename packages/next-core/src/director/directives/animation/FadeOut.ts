import * as PIXI from "pixi.js";
import { AnimationDirective, AnimationDirectiveOptions } from "../base";
import { merge } from "lodash-es";

export class FadeOut extends AnimationDirective {
  constructor(options: AnimationDirectiveOptions, stage: PIXI.Container) {
    super(options, stage);
    this.options = merge(
      {
        toVars: {
          pixi: {
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
