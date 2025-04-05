import * as PIXI from "pixi.js";
import { AnimationDirective, AnimationDirectiveOptions } from "../base";
import { merge } from "lodash-es";

export class ShakeY extends AnimationDirective {
  constructor(options: AnimationDirectiveOptions, stage: PIXI.Container) {
    super(options, stage);
    const target = this.target as PIXI.Sprite;

    if (!target) {
      return;
    }

    const shakeAmplitude = target.height ? target.height * 0.05 : 0;
    const origin = target.y;
    const top = origin - shakeAmplitude;
    const bottom = origin + shakeAmplitude;

    this.options = merge(
      {
        toVars: {
          keyframes: {
            "0%": { y: origin },
            "15%": { y: top },
            "30%": { y: bottom },
            "45%": { y: top },
            "60%": { y: bottom },
            "75%": { y: top },
            "90%": { y: bottom },
            "100%": { y: origin },
          },
          duration: 0.5,
          ease: "none",
        },
      },
      options,
    );
  }
}
