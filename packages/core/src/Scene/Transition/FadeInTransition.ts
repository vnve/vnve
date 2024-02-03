import { Transition } from "./Transition";
import { ICreatorTickCtx } from "../../Creator";

export class FadeInTransition extends Transition {
  public name = "FadeIn";
  async tick(timestamp: number, tickCtx: ICreatorTickCtx) {
    if (tickCtx.currentStage) {
      if (timestamp >= this.start && timestamp <= this.start + this.duration) {
        tickCtx.currentStage.alpha = (timestamp - this.start) / this.duration;
      } else {
        tickCtx.currentStage.alpha = 1;
      }
    }
  }

  public toJSON() {
    return {
      __type: "FadeInTransition",
      start: this.start,
      duration: this.duration,
    };
  }

  static fromJSON(raw: any) {
    return new FadeInTransition({
      start: raw.start,
      duration: raw.duration,
    });
  }
}
