import { OldFilmFilter } from "@pixi/filter-old-film";

export class VignetteFilter extends OldFilmFilter {
  public name = "VignetteFilter";

  constructor() {
    super();
    this.sepia = 0;
    this.noise = 0;
    this.vignetting = 0.5;
  }

  public cloneSelf() {
    return new VignetteFilter();
  }

  public toJSON() {
    return {
      __type: "VignetteFilter",
    };
  }

  static fromJSON() {
    return new VignetteFilter();
  }
}
