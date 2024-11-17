import * as PIXI from "pixi.js";
export abstract class Filter extends PIXI.Filter {
  public label: string = "";
  public name: string = "";

  abstract clone(exact?: boolean): Filter;
  abstract toJSON(): AnyJSON;
}

export function copyTo(from: Filter, to: Filter, exact = false) {
  if (exact) {
    to.name = from.name;
  }
  to.label = from.label;
}

export function toJSON(filter: Filter) {
  return {
    __type: filter.constructor.name,
    label: filter.label,
    name: filter.name,
  };
}

export function copyFromJSON(from: AnyJSON, to: Filter) {
  to.label = from.label;
  to.name = from.name;
}
