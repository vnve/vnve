import { Scene } from "../../../scene";
import { soundController } from "../../lib/SoundController";
import { SoundDirective, SoundDirectiveOptions } from "../base";

export interface PlayDirectiveOptions extends SoundDirectiveOptions {
  start?: number;
  volume?: number;
  loop?: boolean;
  untilEnd?: boolean;
}

export class Play extends SoundDirective {
  protected options: PlayDirectiveOptions;
  constructor(options: PlayDirectiveOptions, stage: Scene) {
    super(options, stage);
    this.options = options;
  }

  execute(): void {
    soundController.play(this.target, this.options);
  }
}
