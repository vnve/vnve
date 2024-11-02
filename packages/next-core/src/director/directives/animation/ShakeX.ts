import * as PIXI from "pixi.js";
import { AnimationDirective, AnimationDirectiveOptions } from "../base";
import { merge } from "lodash-es";

export class ShakeX extends AnimationDirective {
  constructor(options: AnimationDirectiveOptions, stage: PIXI.Container) {
    super(options, stage);
    const target = this.target as PIXI.Sprite;
    const shakeAmplitude = target.width ? target.width * 0.1 : 0;

    this.options = merge(
      {
        toVars: {
          keyframes: Array.from({ length: 6 }, (_, i) => ({
            [`${i * 20}%`]: {
              x:
                i % 2 === 0
                  ? target.x + shakeAmplitude
                  : target.x - shakeAmplitude,
            },
          })).reduce((acc, curr) => ({ ...acc, ...curr }), {}),
          duration: 0.5,
          ease: "none",
        },
      },
      options,
    );
  }
}
