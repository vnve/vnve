import { soundController } from "../../lib/SoundController";
import { SoundDirective } from "../base";

export class Play extends SoundDirective {
  execute(): void {
    soundController.play(this.target);
  }
}
