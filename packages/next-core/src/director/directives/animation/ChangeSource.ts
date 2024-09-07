import * as PIXI from "pixi.js";
import gsap from "gsap";
import { AnimationDirective, AnimationDirectiveOptions } from "../base";

export interface ChangeSourceDirectiveOptions
  extends AnimationDirectiveOptions {
  source: string;
  immediate?: boolean;
}

export class ChangeSource extends AnimationDirective<
  PIXI.Sprite & { source: string; load: () => Promise<void> }
> {
  protected options: ChangeSourceDirectiveOptions;

  constructor(options: ChangeSourceDirectiveOptions, stage: PIXI.Container) {
    super(options, stage);
    this.options = {
      ...options,
      immediate: true,
    };
  }

  public async execute() {
    const { source, immediate } = this.options;
    this.target.source = source;

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
