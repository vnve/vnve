import { Scene } from "../../../scene";
import { soundController } from "../../lib/SoundController";
import { SoundDirective, SoundDirectiveOptions } from "../base";

export interface VoiceDirectiveOptions extends SoundDirectiveOptions {
  volume?: number;
}

export class Voice extends SoundDirective {
  protected declare options: VoiceDirectiveOptions;
  constructor(options: VoiceDirectiveOptions, stage: Scene) {
    super(options, stage);
    this.options = options;
  }

  public async load() {
    if (!this.target.buffer) {
      await this.target.load();
    }
  }

  public execute() {
    soundController.play(this.target, this.options);
  }

  public getDuration(): number {
    return this.options.sequential ? this.target.buffer?.duration ?? 0 : 0;
  }
}
