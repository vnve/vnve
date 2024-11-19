import * as PIXI from "pixi.js";
import { Filter, copyFromJSON, copyTo, toJSON } from "./Filter";
import { uuid } from "../../util";

export class BlurFilter extends PIXI.BlurFilter implements Filter {
  public label = "";
  public name = uuid();
  public type = "BlurFilter";

  public clone(exact = false) {
    const cloned = new BlurFilter();

    copyTo(this, cloned, exact);

    return cloned;
  }

  public toJSON() {
    return toJSON(this);
  }

  static fromJSON(json: AnyJSON) {
    const filter = new BlurFilter();

    copyFromJSON(json, filter);

    return filter;
  }
}
