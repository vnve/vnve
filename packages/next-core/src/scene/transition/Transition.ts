import { uuid } from "../../util";

export abstract class Transition {
  public name: string = uuid();
  public label: string = "";

  public abstract clone(exact?: boolean): Transition;

  public toJSON() {
    return {
      __type: this.constructor.name,
      label: this.label,
      name: this.name,
    };
  }
}
