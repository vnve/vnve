import * as PIXI from "pixi.js";
import { AnimationDirective, AnimationDirectiveOptions } from "../base";
import { merge } from "lodash-es";

export class ShakeX extends AnimationDirective {
  constructor(options: AnimationDirectiveOptions, stage: PIXI.Container) {
    super(options, stage);
    const target = this.target as PIXI.Sprite;

    if (!target) {
      return;
    }

    const shakeAmplitude = target.width ? target.width * 0.05 : 0;
    const origin = target.x;
    const left = origin - shakeAmplitude;
    const right = origin + shakeAmplitude;

    this.options = merge(
      {
        toVars: {
          keyframes: {
            "0%": { x: origin },
            "15%": { x: left },
            "30%": { x: right },
            "45%": { x: left },
            "60%": { x: right },
            "75%": { x: left },
            "90%": { x: right },
            "100%": { x: origin },
          },
          duration: 0.5,
          ease: "none",
        },
      },
      options,
    );
  }
}
