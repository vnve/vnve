import * as PIXI from "pixi.js";
import { Filter, copyFromJSON, copyTo, toJSON } from "./Filter";
import { uuid } from "../../util";

export class BlackMaskFilter extends PIXI.ColorMatrixFilter implements Filter {
  public label: string = "";
  public name = uuid();

  constructor() {
    super();
    this.blackAndWhite(true);
    this.brightness(0, true);
  }

  public clone() {
    const cloned = new BlackMaskFilter();

    copyTo(this, cloned);

    return cloned;
  }

  public toJSON() {
    return toJSON(this);
  }

  static fromJSON(json: AnyJSON) {
    const filter = new BlackMaskFilter();

    copyFromJSON(json, filter);

    return filter;
  }
}
