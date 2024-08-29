import { Transition } from "./Transition";

export class FadeInTransition extends Transition {
  public clone(exact = false) {
    const cloned = new FadeInTransition();

    if (exact) {
      cloned.name = this.name;
    }

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
