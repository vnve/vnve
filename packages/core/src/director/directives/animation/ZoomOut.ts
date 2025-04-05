import * as PIXI from "pixi.js";
import { AnimationDirective, AnimationDirectiveOptions } from "../base";
import { merge } from "lodash-es";

export class ZoomOut extends AnimationDirective {
  constructor(options: AnimationDirectiveOptions, stage: PIXI.Container) {
    super(options, stage);
    const sprite = this.target as PIXI.Sprite | PIXI.Text;

    if (!sprite) {
      return;
    }

    const originalX = sprite.x;
    const originalY = sprite.y;
    sprite.anchor.set(0.5);
    sprite.x = originalX + sprite.width * sprite.anchor.x;
    sprite.y = originalY + sprite.height * sprite.anchor.y;

    this.options = merge(
      {
        toVars: {
          pixi: {
            scale: 0.9,
          },
          ease: "power1.out",
          duration: 0.5,
        },
      },
      options,
    );
  }
}
