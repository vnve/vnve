import * as PIXI from "pixi.js";
import { Directive, DirectiveOptions } from "./Directive";
import { TweenVars } from "./type";
import gsap from "gsap";

export interface TransitionDirectiveOptions extends DirectiveOptions {
  fromVars?: TweenVars;
  toVars?: TweenVars;
}

export class TransitionDirective extends Directive {
  protected declare options: TransitionDirectiveOptions;

  constructor(options: TransitionDirectiveOptions, stage: PIXI.Container) {
    super(options, stage);
    this.options = options;
  }

  public execute() {
    const { fromVars, toVars } = this.options;

    if (fromVars && toVars) {
      gsap.fromTo(this.stage, fromVars, toVars);
    } else if (toVars) {
      gsap.to(this.stage, toVars);
    }
  }

  public getDuration(): number {
    return this.options.sequential ? this.options.toVars?.duration ?? 0 : 0;
  }
}
