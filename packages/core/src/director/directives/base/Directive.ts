import * as PIXI from "pixi.js";

export interface DirectiveOptions {
  executeTime?: number;
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
    this.executeTime = options.executeTime ?? 0;
    this.currentTime = 0;
  }

  abstract execute(): void;
  abstract getDuration(): number;

  public load(): void {}
  public check(): boolean {
    return true;
  }
}
