import * as PIXI from "pixi.js";
import { AnimationDirective, AnimationDirectiveOptions } from "../base";

export interface ChangeSourceDirectiveOptions
  extends AnimationDirectiveOptions {
  source: string;
}

export class ChangeSource extends AnimationDirective<
  PIXI.Sprite & { source: string; load: () => Promise<void> }
> {
  protected options: ChangeSourceDirectiveOptions;

  constructor(options: ChangeSourceDirectiveOptions, stage: PIXI.Container) {
    super(options, stage);
    this.options = options;
  }

  public async execute() {
    this.target.source = this.options.source;
    await this.target.load();
    // TODO: support change effect
  }
}
