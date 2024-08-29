import * as PIXI from "pixi.js";
import { BlackMaskFilter } from "./BlackMaskFilter";
import { BlurFilter } from "./BlurFilter";
import { NoiseFilter } from "./NoiseFilter";
import { OldFilmFilter } from "./OldFilmFilter";
import { VignetteFilter } from "./VignetteFilter";

const FilterClassMap: ClassMap = {
  BlackMaskFilter,
  BlurFilter,
  NoiseFilter,
  OldFilmFilter,
  VignetteFilter,
};

export function reviveFilters(json: AnyJSON) {
  if (!json) {
    return;
  }

  return json.map((item: AnyJSON) => {
    return FilterClassMap[item.__type].fromJSON(item);
  });
}

export abstract class Filter extends PIXI.Filter {
  public label: string = "";
  public name: string = "";

  abstract clone(): Filter;
  abstract toJSON(): AnyJSON;
}

export function copyTo(from: Filter, to: Filter) {
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
