import * as PIXI from "pixi.js";
import { Directive, DirectiveOptions } from "./Directive";

interface SoundDirectiveOptions extends DirectiveOptions {}

export abstract class SoundDirective extends Directive {
  // protected target: PIXI.DisplayObject; // TODO: sound

  constructor(options: SoundDirectiveOptions, stage: PIXI.Container) {
    super(options, stage);
    // this.target = this.stage.getChildByName(options.targetName)!;
  }
}
