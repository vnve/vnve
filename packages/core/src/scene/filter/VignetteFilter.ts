import { OldFilmFilter } from "@pixi/filter-old-film";
import { Filter, copyFromJSON, copyTo, toJSON } from "./Filter";
import { uuid } from "../../util";

export class VignetteFilter extends OldFilmFilter implements Filter {
  public label = "";
  public name = uuid();
  public type = "VignetteFilter";

  constructor() {
    super();
    this.sepia = 0;
    this.noise = 0;
    this.vignetting = 0.5;
  }

  public clone(exact = false) {
    const cloned = new VignetteFilter();

    copyTo(this, cloned, exact);

    return cloned;
  }

  public toJSON() {
    return toJSON(this);
  }

  static fromJSON(json: AnyJSON) {
    const filter = new VignetteFilter();

    copyFromJSON(json, filter);

    return filter;
  }
}
