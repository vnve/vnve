import * as PIXI from "pixi.js";
import gsap from "gsap";
import { AnimationDirective, AnimationDirectiveOptions } from "../base";

export interface SpeakDirectiveOptions extends AnimationDirectiveOptions {
  text: string;
  wordsPerMin?: number;
  interval?: number;
  append?: boolean;
}

export class Speak extends AnimationDirective<PIXI.Text> {
  protected options: SpeakDirectiveOptions;

  constructor(options: SpeakDirectiveOptions, stage: PIXI.Container) {
    super(options, stage);
    this.options = {
      interval: 0.2,
      sequential: true,
      ...options,
    };
  }

  public execute(): void {
    const { text, wordsPerMin, append } = this.options;
    let fromText = "";
    let toText = text;

    this.target.visible = true;

    if (append) {
      fromText = this.target.text;
      toText = this.target.text + text;
    }

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

  public getDuration(): number {
    const { sequential, text, wordsPerMin, interval } = this.options;

    return sequential
      ? this.readingTime(text, wordsPerMin) + (interval ?? 0)
      : 0;
  }

  readingTime(text: string, wordsPerMin = 600) {
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
