import { uuid } from "../../util";
import { FadeInTransition } from "./FadeInTransition";

export abstract class Transition {
  public name: string = uuid();
  public label: string = "";

  public abstract clone(): Transition;

  public toJSON() {
    return {
      __type: this.constructor.name,
      label: this.label,
      name: this.name,
    };
  }
}

export { FadeInTransition };

const TransitionClassMap: ClassMap = {
  FadeInTransition,
};

export function reviveTransition(transitionsJSON: AnyJSON) {
  const transitions = [];

  for (const json of transitionsJSON) {
    const TransitionClass = TransitionClassMap[json.__type];

    const transition = TransitionClass.fromJSON(json);

    transitions.push(transition);
  }

  return transitions;
}
