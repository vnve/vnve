import * as PIXI from "pixi.js";

export interface DirectiveOptions {
  sequential?: boolean;
}

export abstract class Directive {
  protected options: DirectiveOptions;
  protected stage: PIXI.Container;
  public executeTime: number;
  public currentTime: number;

  constructor(options: DirectiveOptions, stage: PIXI.Container) {
    this.options = options;
    this.stage = stage;
    this.executeTime = 0;
    this.currentTime = 0;
  }

  abstract execute(): void;
  abstract getDuration(): number;
}
