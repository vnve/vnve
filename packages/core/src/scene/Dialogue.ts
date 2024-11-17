import { SpeakDirectiveOptions } from "../director";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Line = any; // TODO: 同plate.js的value

interface DialogueOptions {
  speak: SpeakDirectiveOptions;
  lines: Line[];
}

export class Dialogue {
  public speak: SpeakDirectiveOptions;
  public lines: Line[];

  constructor(options: DialogueOptions) {
    this.speak = options.speak;
    this.lines = options.lines || [];
  }
}
