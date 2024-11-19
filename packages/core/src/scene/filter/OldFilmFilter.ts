import { OldFilmFilter as RawOldFilmFilter } from "@pixi/filter-old-film";
import { Filter, copyFromJSON, copyTo, toJSON } from "./Filter";
import { uuid } from "../../util";

export class OldFilmFilter extends RawOldFilmFilter implements Filter {
  public label = "";
  public name = uuid();
  public type = "OldFilmFilter";

  public clone(exact = false) {
    const cloned = new OldFilmFilter();

    copyTo(this, cloned, exact);

    return cloned;
  }

  public toJSON() {
    return toJSON(this);
  }

  static fromJSON(json: AnyJSON) {
    const filter = new OldFilmFilter();

    copyFromJSON(json, filter);

    return filter;
  }
}
