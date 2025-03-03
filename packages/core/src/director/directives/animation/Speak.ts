import * as PIXI from "pixi.js";
import gsap from "gsap";
import {
  AnimationDirective,
  AnimationDirectiveOptions,
  Directive,
} from "../base";
import { Speaker, SpeakerDirectiveOptions } from "./Speaker";
import { Voice, VoiceDirectiveOptions } from "../sound";
import { Scene } from "../../../scene";
import { merge } from "lodash-es";
import { readingTime } from "../../lib/reading";

export type SpeakDirectiveEffect = "typewriter" | "fadeIn" | "none";

export interface SpeakDirectiveOptions extends AnimationDirectiveOptions {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  lines: any[];
  text: string;
  wordsPerMin?: number;
  interval?: number;
  append?: boolean;
  effect?: SpeakDirectiveEffect;
  effectDuration?: number;
  alignWithVoice?: boolean;
  dialogTargetName?: string;
  speaker?: SpeakerDirectiveOptions;
  voice?: VoiceDirectiveOptions;
}

export class Speak extends AnimationDirective<PIXI.Text> {
  protected declare options: SpeakDirectiveOptions;
  private speakerDirective?: Speaker;
  private voiceDirective?: Voice;
  private inlineDirectiveList: Array<Directive>;
  private tl: gsap.core.Timeline;

  constructor(options: SpeakDirectiveOptions, stage: PIXI.Container) {
    super(options, stage);
    this.options = merge(
      {
        interval: 0.2,
        sequential: true,
        effect: "typewriter",
        effectDuration: 0.5,
        alignWithVoice: true,
      },
      options,
    );
    const { speaker, voice, lines, executeTime } = this.options;

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

    this.tl = gsap.timeline({ paused: true });

    this.inlineDirectiveList = [];
    // 解析生成指令列表
    // lines.forEach((line) => {
    //   if (line.type === "p") {
    //     for (let index = 0; index < line.children.length; index++) {
    //       const child = line.children[index];

    //       if (child.type === "directive") {
    //         const { directive: directiveName, params } = child.value;
    //       } else if (child.text) {
    //         let text = child.text;

    //         if (index === line.children.length - 1) {
    //           // 最后一个元素是文本，增加换行符
    //           text += "\n";
    //         }

    //         // 默认speak指令
    //         this.inlineDirectiveList.push();
    //       }
    //     }
    //   }
    // });
  }

  public async load() {
    if (this.voiceDirective) {
      await this.voiceDirective.load();
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

    // 仅首个Speak指令执行voice
    if (!append) {
      this.voiceDirective?.execute();
    }
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
    const { effectDuration } = this.options;

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
        duration: effectDuration,
        ease: "none",
      },
    );
  }

  private none(_fromText: string, toText: string) {
    this.target.text = toText;
  }

  public getDuration(): number {
    const { sequential, text, wordsPerMin, interval } = this.options;
    let readingTime = this.readingTime(text, wordsPerMin);
    const duration = readingTime + (interval ?? 0);

    // 存在配音时，取文字和配音时长的最大值
    if (this.voiceDirective) {
      const voiceDuration = this.voiceDirective.getDuration();
      readingTime = Math.max(readingTime, voiceDuration);
    }

    return sequential ? duration : 0;
  }

  private readingTime(text: string, wordsPerMin = 500) {
    if (!text) {
      return 0;
    }

    return readingTime(text, { wordsPerMin }).seconds;
  }
}
