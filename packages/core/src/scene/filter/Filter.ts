import * as PIXI from "pixi.js";
export abstract class Filter extends PIXI.Filter {
  public declare label: string;
  public declare name: string;
  public declare type: string;

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
    __type: filter.type,
    label: filter.label,
    name: filter.name,
  };
}

export function copyFromJSON(from: AnyJSON, to: Filter) {
  to.label = from.label;
  to.name = from.name;
}
