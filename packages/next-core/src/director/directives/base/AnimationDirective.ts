import * as PIXI from "pixi.js";
import gsap from "gsap";
import { Directive, DirectiveOptions } from "./Directive";

interface TweenVars {
  duration?: number;
  ease?: string;
  delay?: number;
  pixi?: {
    alpha?: number | string;
    anchor?: number;
    anchorX?: number | string;
    anchorY?: number | string;
    angle?: number | string;
    autoAlpha?: number;
    blur?: number;
    blurX?: number;
    blurY?: number;
    blurPadding?: number;
    brightness?: number;
    colorize?: string | number;
    colorizeAmount?: number;
    combineCMF?: boolean;
    contrast?: number;
    fillColor?: string | number;
    height?: number | string;
    hue?: number;
    lineColor?: string | number;
    pivot?: number;
    pivotX?: number | string;
    pivotY?: number | string;
    position?: number | string;
    positionX?: number | string;
    positionY?: number | string;
    resolution?: number;
    rotation?: number | string;
    saturation?: number;
    scale?: number | string;
    scaleX?: number | string;
    scaleY?: number | string;
    skew?: number | string;
    skewX?: number | string;
    skewY?: number | string;
    tilePosition?: number;
    tilePositionX?: number | string;
    tilePositionY?: number | string;
    tileScale?: number;
    tileScaleX?: number | string;
    tileScaleY?: number | string;
    tileX?: number | string;
    tileY?: number | string;
    tint?: string | number;
    width?: number | string;
    x?: number | string;
    y?: number | string;
    zIndex?: number | string;
  };
}

export interface AnimationDirectiveOptions extends DirectiveOptions {
  targetName: string;
  sequential?: boolean;
  fromVars?: TweenVars;
  toVars?: TweenVars;
}

export abstract class AnimationDirective extends Directive {
  protected target: PIXI.DisplayObject;
  protected options: AnimationDirectiveOptions;

  constructor(options: AnimationDirectiveOptions, stage: PIXI.Container) {
    super(options, stage);
    this.options = options;
    this.target = this.stage.getChildByName(options.targetName, true)!;
  }

  public execute(): void {
    const { fromVars, toVars } = this.options;

    if (fromVars && toVars) {
      console.log("from", fromVars);
      gsap.fromTo(this.target, fromVars, toVars);
    } else if (toVars) {
      gsap.to(this.target, toVars);
    }
  }

  public getDuration(): number {
    // 动画指令默认不占视频时长，即同时执行
    return this.options.sequential ? this.options.toVars?.duration ?? 0 : 0;
  }
}
