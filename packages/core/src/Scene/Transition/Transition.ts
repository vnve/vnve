import { ICreatorTickCtx } from "../../Creator";

interface ITransitionOptions {
  start?: number;
  duration: number;
}

export class Transition {
  public name: string;
  public start: number;
  public duration: number;

  constructor(options: ITransitionOptions) {
    this.name = "";
    this.start = options.start ?? 0;
    this.duration = options.duration ?? 0;
  }

  async tick(_timestamp: number, _tickCtx: ICreatorTickCtx) {
    //
  }
}
