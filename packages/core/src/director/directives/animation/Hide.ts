import * as PIXI from "pixi.js";
import { AnimationDirective, AnimationDirectiveOptions } from "../base";
import { merge } from "lodash-es";

export class Hide extends AnimationDirective {
  constructor(options: AnimationDirectiveOptions, stage: PIXI.Container) {
    super(options, stage);
    this.options = merge(
      {
        toVars: {
          pixi: {
            visible: false,
          },
          ease: "none",
          duration: 0,
        },
      },
      options,
    );
  }
}
