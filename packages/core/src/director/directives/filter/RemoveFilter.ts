import { FilterDirective, FilterDirectiveOptions } from "../base";

export interface RemoveFilterDirectiveOptions extends FilterDirectiveOptions {}

export class RemoveFilter extends FilterDirective {
  public execute(): void {
    const { targetName } = this.options;

    if (targetName) {
      if (this.target) {
        this.target.filters = [];
      }
    } else {
      this.stage.filters = [];
    }
  }
}
