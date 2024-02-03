import { OldFilmFilter as RawOldFilmFilter } from "@pixi/filter-old-film";

export class OldFilmFilter extends RawOldFilmFilter {
  public name = "OldFilmFilter";

  public cloneSelf() {
    return new OldFilmFilter();
  }

  public toJSON() {
    return {
      __type: "OldFilmFilter",
    };
  }

  static fromJSON() {
    return new OldFilmFilter();
  }
}
