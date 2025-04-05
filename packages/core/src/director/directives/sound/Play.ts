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
  protected declare options: PlayDirectiveOptions;
  constructor(options: PlayDirectiveOptions, stage: Scene) {
    super(options, stage);
    this.options = options;
  }

  public async load() {
    if (!this.target.buffer) {
      await this.target.load();
    }
  }

  public execute(): void {
    soundController.play(this.target, this.options);
  }

  public getDuration(): number {
    return this.options.sequential ? this.target.buffer?.duration ?? 0 : 0;
  }
}
