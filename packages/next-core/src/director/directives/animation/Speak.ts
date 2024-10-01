import * as PIXI from "pixi.js";
import gsap from "gsap";
import { AnimationDirective, AnimationDirectiveOptions } from "../base";
import { Speaker, SpeakerDirectiveOptions } from "./Speaker";
import { Voice, VoiceDirectiveOptions } from "../sound";
import { Scene } from "../../../scene";

export type SpeakDirectiveEffect = "typewriter" | "fadeIn";

export interface SpeakDirectiveOptions extends AnimationDirectiveOptions {
  text: string;
  wordsPerMin?: number;
  interval?: number;
  append?: boolean;
  effect?: SpeakDirectiveEffect;
  alignWithVoice?: boolean;
  speaker?: SpeakerDirectiveOptions;
  voice?: VoiceDirectiveOptions;
}

export class Speak extends AnimationDirective<PIXI.Text> {
  protected options: SpeakDirectiveOptions;
  private speakerDirective?: Speaker;
  private voiceDirective?: Voice;

  constructor(options: SpeakDirectiveOptions, stage: PIXI.Container) {
    super(options, stage);
    this.options = {
      interval: 0.2,
      sequential: true,
      effect: "typewriter",
      ...options,
    };
    const { speaker, voice } = this.options;

    if (speaker) {
      this.speakerDirective = new Speaker(speaker, stage);
    }

    if (voice) {
      this.voiceDirective = new Voice(voice, this.stage as Scene);
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

  public getDuration(): number {
    const { sequential, text, wordsPerMin, interval, alignWithVoice } =
      this.options;
    let duration = this.readingTime(text, wordsPerMin) + (interval ?? 0);

    if (alignWithVoice) {
      const voiceDuration = this.voiceDirective?.getDuration() ?? 0;

      duration = Math.max(duration, voiceDuration);
    }

    return sequential ? duration : 0;
  }

  private readingTime(text: string, wordsPerMin = 600) {
    if (!text) {
      return 0;
    }

    text = text.trim();
    // step 1: count the number of Chinese characters
    const charArray = text.match(/[\u4e00-\u9fa5]/g);
    let charCount = 0;
    if (charArray != null) {
      charCount = charArray.length;
    }
    // step 2: replace all the Chinese characters with blank
    text = text.replace(/[\u4e00-\u9fa5]/g, " ");
    // step 3:replace newlines with blank
    text = text.replace(/[\r\n]/g, " ");
    // step 4:replace special characters with blank
    text = text.replace(/\W+/g, " ");
    // step 5: count the number of total English words
    const totalEnWords = text.trim().split(/\s+/g).length;
    const totalWords = totalEnWords + charCount;
    const wordsPerSecond = wordsPerMin / 60;

    return parseFloat((totalWords / wordsPerSecond).toFixed(1));
  }
}
