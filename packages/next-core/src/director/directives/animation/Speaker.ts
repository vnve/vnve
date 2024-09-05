import * as PIXI from "pixi.js";
import gsap from "gsap";
import { AnimationDirective, AnimationDirectiveOptions } from "../base";

export interface SpeakerDirectiveOptions extends AnimationDirectiveOptions {
  name: string;
  speakerTargetName?: string;
  autoShowSpeaker?: string;
  autoMaskOtherSpeakers?: boolean;
}

export class Speaker extends AnimationDirective<PIXI.Text> {
  protected options: SpeakerDirectiveOptions;
  protected speakerTarget?: PIXI.DisplayObject | null;

  constructor(options: SpeakerDirectiveOptions, stage: PIXI.Container) {
    super(options, stage);
    this.options = {
      autoShowSpeaker: "Show",
      autoMaskOtherSpeakers: true,
      ...options,
    };
    const { speakerTargetName } = this.options;

    if (speakerTargetName) {
      this.speakerTarget = this.stage.getChildByName(speakerTargetName);
    }
  }

  public execute() {
    const { name, autoShowSpeaker } = this.options;

    if (this.target) {
      this.target.visible = true;
      this.target.text = name;
    }

    if (autoShowSpeaker && this.speakerTarget) {
      this.speakerTarget.visible = true;
      console.log("speakerTarget", this.speakerTarget.width);
      // TODO: 需要额外判断speakerTarget的状态，假如已经执行过入场，则无需继续叠加动画效果
      // TODO: 根据autoShowSpeaker的效果，调用对应动画Directives
    }
  }
}
