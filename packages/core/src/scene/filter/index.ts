import { reviveList } from "../../util";
import { Filter } from "./Filter";
import { BlackMaskFilter } from "./BlackMaskFilter";
import { BlurFilter } from "./BlurFilter";
import { NoiseFilter } from "./NoiseFilter";
import { OldFilmFilter } from "./OldFilmFilter";
import { VignetteFilter } from "./VignetteFilter";

export {
  Filter,
  BlackMaskFilter,
  BlurFilter,
  NoiseFilter,
  OldFilmFilter,
  VignetteFilter,
};
export const FilterClassMap: ClassMap = {
  BlackMaskFilter,
  BlurFilter,
  NoiseFilter,
  OldFilmFilter,
  VignetteFilter,
};
export function reviveFilters(json: AnyJSON): Promise<Filter[]> {
  return reviveList(FilterClassMap, json);
}
