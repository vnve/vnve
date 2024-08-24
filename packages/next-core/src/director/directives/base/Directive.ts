import * as PIXI from "pixi.js";

export interface DirectiveOptions {}

export abstract class Directive {
  protected options: DirectiveOptions;
  protected stage: PIXI.Container;
  public executeTime: number;

  constructor(options: DirectiveOptions, stage: PIXI.Container) {
    this.options = options;
    this.stage = stage;
    this.executeTime = 0;
  }

  abstract execute(): void;
  abstract getDuration(): number;
}
