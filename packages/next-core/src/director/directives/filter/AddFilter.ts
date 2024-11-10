import * as PIXI from "pixi.js";
import { FilterDirective, FilterDirectiveOptions } from "../base";
import { FilterClassMap } from "../../../scene";

export interface AddFilterDirectiveOptions extends FilterDirectiveOptions {
  filterName: string;
}

export class AddFilter extends FilterDirective {
  protected declare options: AddFilterDirectiveOptions;

  constructor(options: AddFilterDirectiveOptions, stage: PIXI.Container) {
    super(options, stage);
    this.options = options;
  }

  public execute(): void {
    const { targetName, filterName } = this.options;

    if (targetName) {
      if (this.target) {
        this.addFilter(this.target, filterName);
      }
    } else {
      this.addFilter(this.stage, filterName);
    }
  }

  private addFilter(target: PIXI.DisplayObject, filterName: string) {
    const filter = new FilterClassMap[filterName]();

    if (target.filters) {
      target.filters.push(filter);
    } else {
      target.filters = [filter];
    }
  }
}
