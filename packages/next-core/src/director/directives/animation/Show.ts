import * as PIXI from "pixi.js";
import { AnimationDirective, AnimationDirectiveOptions } from "../base";
import { merge } from "lodash-es";

export class Show extends AnimationDirective {
  constructor(options: AnimationDirectiveOptions, stage: PIXI.Container) {
    super(options, stage);
    this.options = merge(
      {
        toVars: {
          pixi: {
            visible: true,
          },
          ease: "none",
          duration: 0,
        },
      },
      options,
    );
  }
}
