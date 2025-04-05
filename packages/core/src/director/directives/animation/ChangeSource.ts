import * as PIXI from "pixi.js";
import gsap from "gsap";
import { AnimationDirective, AnimationDirectiveOptions } from "../base";
import { Sprite } from "../../../scene";

export interface ChangeSourceDirectiveOptions
  extends AnimationDirectiveOptions {
  source: string;
  immediate?: boolean;
}

export class ChangeSource extends AnimationDirective<Sprite> {
  protected declare options: ChangeSourceDirectiveOptions;

  constructor(options: ChangeSourceDirectiveOptions, stage: PIXI.Container) {
    super(options, stage);
    this.options = {
      ...options,
      immediate: true,
    };
  }

  public async execute() {
    const { source, immediate } = this.options;

    // TODO: 预加载资源
    this.target.changeSource(source);

    if (immediate) {
      await this.target.load();
    } else {
      gsap.to(this.target, {
        pixi: {
          alpha: 0,
        },
        duration: 0.3,
        onComplete: () => {
          this.target.load().then(() => {
            gsap.to(this.target, {
              pixi: {
                alpha: 1,
              },
              duration: 0.3,
            });
          });
        },
      });
    }
  }
}
