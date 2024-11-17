import * as PIXI from "pixi.js";
import { TransitionDirective, TransitionDirectiveOptions } from "../base";
import { merge } from "lodash-es";

export class FadeInTransition extends TransitionDirective {
  constructor(options: TransitionDirectiveOptions, stage: PIXI.Container) {
    super(options, stage);
    this.options = merge(
      {
        fromVars: {
          pixi: {
            alpha: 0,
          },
        },
        toVars: {
          pixi: {
            alpha: 1,
          },
          ease: "power1.in",
          duration: 0.3,
        },
      },
      options,
    );
  }
}
