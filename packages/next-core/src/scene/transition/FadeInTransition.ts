import { Transition } from "./Transition";

export class FadeInTransition extends Transition {
  public clone() {
    const cloned = new FadeInTransition();
    cloned.label = this.label;

    return cloned;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromJSON(json: any) {
    const transition = new FadeInTransition();
    transition.label = json.label;
    transition.name = json.name;

    return transition;
  }
}
