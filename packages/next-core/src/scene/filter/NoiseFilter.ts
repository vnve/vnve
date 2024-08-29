import * as PIXI from "pixi.js";
import { Filter, copyFromJSON, copyTo, toJSON } from "./Filter";
import { uuid } from "../../util";

export class NoiseFilter extends PIXI.NoiseFilter implements Filter {
  public label: string = "";
  public name = uuid();

  public clone() {
    const cloned = new NoiseFilter();

    copyTo(this, cloned);

    return cloned;
  }

  public toJSON() {
    return toJSON(this);
  }

  static fromJSON(json: AnyJSON) {
    const filter = new NoiseFilter();

    copyFromJSON(json, filter);

    return filter;
  }
}
