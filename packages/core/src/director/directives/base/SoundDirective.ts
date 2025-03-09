import { Scene, Sound } from "../../../scene";
import { Directive, DirectiveOptions } from "./Directive";

export interface SoundDirectiveOptions extends DirectiveOptions {
  targetName: string;
}

export abstract class SoundDirective extends Directive {
  protected declare stage: Scene;
  protected target: Sound;

  constructor(options: SoundDirectiveOptions, stage: Scene) {
    super(options, stage);
    this.stage = stage;
    this.target = this.stage.getSoundByName(options.targetName)!;
  }

  public check() {
    return !!this.target;
  }

  public getDuration(): number {
    return 0;
  }
}
