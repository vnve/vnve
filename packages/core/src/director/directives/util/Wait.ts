import * as PIXI from "pixi.js";
import { Directive, DirectiveOptions } from "../base";
import { merge } from "lodash-es";

export interface WaitDirectiveOptions extends DirectiveOptions {
  duration: number;
}

export class Wait extends Directive {
  protected declare options: WaitDirectiveOptions;

  constructor(options: WaitDirectiveOptions, stage: PIXI.Container) {
    super(options, stage);
    this.options = merge<Partial<WaitDirectiveOptions>, WaitDirectiveOptions>(
      {
        sequential: true,
      },
      options,
    );
  }

  public execute() {
    // noop
  }

  public getDuration(): number {
    return this.options.duration;
  }
}
