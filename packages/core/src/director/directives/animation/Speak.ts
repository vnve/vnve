import * as PIXI from "pixi.js";
import gsap from "gsap";
import { AnimationDirective, AnimationDirectiveOptions } from "../base";
import { Speaker, SpeakerDirectiveOptions } from "./Speaker";
import { Voice, VoiceDirectiveOptions } from "../sound";
import { Scene } from "../../../scene";
import { merge } from "lodash-es";
import { readingTime } from "../../lib/reading";

export type SpeakDirectiveEffect = "typewriter" | "fadeIn" | "none";

export interface SpeakDirectiveOptions extends AnimationDirectiveOptions {
  text: string;
  wordsPerMin?: number;
  interval?: number;
  append?: boolean;
  customReadingTime?: number;
  effect?: SpeakDirectiveEffect;
  alignWithVoice?: boolean;
  dialogTargetName?: string;
  speaker?: SpeakerDirectiveOptions;
  voice?: VoiceDirectiveOptions;
}

export class Speak extends AnimationDirective<PIXI.Text> {
  protected declare options: SpeakDirectiveOptions;
  private speakerDirective?: Speaker;
  private voiceDirective?: Voice;

  constructor(options: SpeakDirectiveOptions, stage: PIXI.Container) {
    super(options, stage);
    this.options = merge(
      {
        interval: 0.2,
        sequential: true,
        effect: "typewriter",
        alignWithVoice: true,
      },
      options,
    );
    const { speaker, voice, executeTime } = this.options;

    if (speaker?.targetName) {
      this.speakerDirective = new Speaker(
        {
          ...speaker,
          executeTime,
        },
        stage,
      );
    }

    if (voice?.targetName) {
      this.voiceDirective = new Voice(
        {
          ...voice,
          executeTime,
          sequential: true, // speak中的voice子指令默认串行，方便文字和语音时长对齐
        },
        this.stage as Scene,
      );
    }
  }

  public execute(): void {
    if (!this.target) {
      return;
    }

    const { text, append, effect } = this.options;
    let fromText = "";
    let toText = text;

    this.target.visible = true;

    if (append) {
      fromText = this.target.text;
      toText = this.target.text + text;
    }

    switch (effect) {
      case "typewriter":
        this.typewriter(fromText, toText);
        break;
      case "fadeIn":
        this.fadeIn(fromText, toText);
        break;
      case "none":
        this.none(fromText, toText);
        break;
    }

    this.speakerDirective?.execute();
    this.voiceDirective?.execute();
  }

  private typewriter(fromText: string, toText: string) {
    const { text, wordsPerMin } = this.options;

    gsap.fromTo(
      this.target,
      {
        text: {
          value: fromText,
        },
      },
      {
        text: {
          value: toText,
        },
        duration: this.readingTime(text, wordsPerMin),
        ease: "none",
      },
    );
  }

  // TODO: 优化效果
  private fadeIn(fromText: string, toText: string) {
    gsap.fromTo(
      this.target,
      {
        pixi: {
          alpha: 0,
        },
        text: {
          value: fromText,
        },
      },
      {
        pixi: {
          alpha: 1,
        },
        text: {
          value: toText,
        },
        duration: 0.5,
        ease: "none",
      },
    );
  }

  private none(_fromText: string, toText: string) {
    this.target.text = toText;
  }

  public getDuration(): number {
    const { sequential, text, wordsPerMin, interval } = this.options;
    const duration = this.readingTime(text, wordsPerMin) + (interval ?? 0);

    return sequential ? duration : 0;
  }

  private readingTime(text: string, wordsPerMin = 500) {
    const { customReadingTime } = this.options;

    if (typeof customReadingTime === "number") {
      return customReadingTime;
    }

    if (!text) {
      return 0;
    }

    return readingTime(text, { wordsPerMin }).seconds;
  }
}
