import * as PIXI from "pixi.js";
import gsap from "gsap";
import { AnimationDirective, AnimationDirectiveOptions } from "../base";
import { Speaker, SpeakerDirectiveOptions } from "./Speaker";
import { Voice, VoiceDirectiveOptions } from "../sound";
import { Scene } from "../../../scene";
import { merge } from "lodash-es";
import { readingTime } from "../../lib/reading";

export type SpeakDirectiveEffect =
  | "typewriter"
  | "typewriterFadeIn"
  | "fadeIn"
  | "none";

export interface SpeakDirectiveOptions extends AnimationDirectiveOptions {
  text: string;
  wordsPerMin?: number;
  interval?: number;
  append?: boolean;
  voiceDuration?: number;
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
      case "typewriterFadeIn":
        this.typewriterFadeIn(fromText, toText);
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

  private typewriterFadeIn(fromText: string, toText: string) {
    const { text, wordsPerMin } = this.options;

    this.target.text = toText;

    typewriteFadeIn(
      this.target,
      this.stage,
      fromText,
      this.readingTime(text, wordsPerMin),
    );
  }

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
    const { effect, sequential, text, wordsPerMin, interval, voiceDuration } =
      this.options;
    let readingTime = this.readingTime(text, wordsPerMin);

    if (effect === "typewriterFadeIn") {
      return readingTime + 1;
    }

    // 存在配音时，取文字和配音时长的最大值
    if (voiceDuration) {
      readingTime = Math.max(readingTime, voiceDuration);
    }

    const duration = readingTime + (interval ?? 0);

    return sequential ? duration : 0;
  }

  private readingTime(text: string, wordsPerMin = 500) {
    if (!text) {
      return 0;
    }

    return readingTime(text, { wordsPerMin }).seconds;
  }
}

function typewriteFadeIn(
  originalText: PIXI.Text,
  stage: PIXI.Container,
  fromText: string,
  duration: number,
) {
  const perCharDuration =
    duration / (originalText.text.length - fromText.length);

  // 隐藏原始文本
  originalText.alpha = 0;

  const charList: PIXI.Text[] = [];
  // 获取文本内容和样式
  const text = originalText.text;
  const style = originalText.style;

  // 使用 PIXI.TextMetrics 测量文本
  const metrics = PIXI.TextMetrics.measureText(text, style);

  // 获取换行后的每一行
  const lines = metrics.lines;

  // 初始化 Y 坐标
  let currentY = originalText.y;

  // 遍历每行文本
  lines.forEach((line) => {
    // 初始化当前 X 坐标
    let currentX = originalText.x;

    // 遍历每个字符
    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      // 创建每个字符的 Text
      const charText = new PIXI.Text(char, style);

      // 测量单个字符的宽度
      const charMetrics = PIXI.TextMetrics.measureText(char, style);

      // 设置字符位置
      charText.x = currentX;
      charText.y = currentY;
      charText.alpha = charList.length < fromText.length ? 1 : 0;
      charText.zIndex = originalText.zIndex;

      // 更新 X 坐标
      currentX += charMetrics.width;

      // 添加到场景
      stage.addChild(charText);
      charList.push(charText);
    }

    // 更新 Y 坐标
    currentY += metrics.lineHeight;
  });

  console.log("perCharDuration", fromText, perCharDuration);

  // 打字机渐入效果
  charList.forEach((char, index) => {
    if (index < fromText.length) {
      return;
    }

    console.log("to", index, char.text);

    gsap.to(char, {
      alpha: 1,
      duration: 0.3,
      delay: index * perCharDuration,
      onComplete: () => {
        console.log("onComplete", index, charList[index].text);
        if (index === charList.length - 1) {
          charList.forEach((char) => {
            stage.removeChild(char);
            originalText.alpha = 1;
          });
        }
      },
    });
  });
}
