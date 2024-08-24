import * as PIXI from "pixi.js";
import { Directive, DirectiveOptions } from "../base";

export interface WaitDirectiveOptions extends DirectiveOptions {
  duration: number;
}

export class Wait extends Directive {
  protected options: WaitDirectiveOptions;

  constructor(options: WaitDirectiveOptions, stage: PIXI.Container) {
    super(options, stage);
    this.options = options;
  }

  public execute() {
    // noop
  }

  public getDuration(): number {
    return this.options.duration;
  }
}
