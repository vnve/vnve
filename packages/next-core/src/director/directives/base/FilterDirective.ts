import * as PIXI from "pixi.js";
import { Directive, DirectiveOptions } from "./Directive";

export interface FilterDirectiveOptions extends DirectiveOptions {
  /**
   * 存在targetName添加到指定对象，否则添加到stage
   */
  targetName?: string;
}

export abstract class FilterDirective extends Directive {
  protected declare stage: PIXI.Container;
  protected target?: PIXI.DisplayObject;
  protected declare options: FilterDirectiveOptions;

  constructor(options: FilterDirectiveOptions, stage: PIXI.Container) {
    super(options, stage);
    this.options = options;
    this.stage = stage;
    if (options.targetName) {
      this.target = this.stage.getChildByName(options.targetName)!;
    }
  }

  public getDuration(): number {
    return 0;
  }
}
