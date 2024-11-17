import { soundController } from "../../lib/SoundController";
import { SoundDirective } from "../base";

export class Pause extends SoundDirective {
  execute(): void {
    soundController.pause(this.target);
  }
}
