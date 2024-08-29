import { soundController } from "../../lib/SoundController";
import { SoundDirective } from "../base";

export class Stop extends SoundDirective {
  execute(): void {
    soundController.stop(this.target);
  }
}
