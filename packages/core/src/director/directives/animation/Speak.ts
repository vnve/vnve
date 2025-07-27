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
import * as Directives from "../../directives";

export type SpeakDirectiveEffect =
  | "typewriter"
  | "typewriteFadeIn"
  | "fadeIn"
  | "none";

export interface SpeakDirectiveOptions extends AnimationDirectiveOptions {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  lines: any[];
  wordsPerMin?: number;
  interval?: number;
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
  private inlineList: Array<{
    type: "text" | "directive";
    value: string | Directive;
    name?: string;
  }>;
  private duration: number;
  private text: string;
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
    this.duration = 0;
    this.text = "";
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

    this.inlineList = [];

    // 解析行内指令
    lines.forEach((line) => {
      if (line.type === "p") {
        for (let index = 0; index < line.children.length; index++) {
          const child = line.children[index];
          if (child.type === "directive") {
            const { directive: directiveName, params } = child.value;
            const DirectiveClass =
              Directives[directiveName as keyof typeof Directives];

            if (DirectiveClass) {
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              const directive = new DirectiveClass(params, stage);

              this.inlineList.push({
                type: "directive",
                value: directive,
                name: directiveName,
              });
            }
          } else if (child.text) {
            let text = child.text;

            if (index === line.children.length - 1) {
              // 最后一个元素是文本，增加换行符
              text += "\n";
            }

            // 默认speak指令
            this.inlineList.push({
              type: "text",
              value: text,
            });
          }
        }
      }
    });
  }

  public check() {
    let result = true;

    for (const item of this.inlineList) {
      if (item.type === "directive") {
        const directive = item.value as Directive;

        if (!directive.check()) {
          result = false;
          // TODO: 待优化
          throw {
            type: "custom",
            message: "speak inline directive check failed",
            errorSceneName: (this.stage as Scene).label,
            errorDirectiveName: item.name,
            errorLines: this.inlineList
              .filter((item) => item.type === "text")
              .map((item) => item.value)
              .join("")
              .slice(0, 10),
          };
        }
      }
    }

    return result;
  }

  public async load() {
    if (this.voiceDirective) {
      await this.voiceDirective.load();
    }

    if (this.target) {
      this.target.text = ""; // 清空遗留的展示文本
    }

    for (const item of this.inlineList) {
      if (item.type === "directive") {
        const directive = item.value as Directive;

        await directive.load();
        this.tl.add(() => {
          directive.execute();
        }, this.duration);
        this.duration += directive.getDuration();
      } else {
        const text = item.value as string;
        const duration = this.readingTime(text, this.options.wordsPerMin);

        this.textAnimate(text, duration);
        this.duration += duration;
      }
    }
  }

  public execute(): void {
    if (this.target) {
      this.target.visible = true;
    }
    this.tl.play();
    this.speakerDirective?.execute();
    this.voiceDirective?.execute();
  }

  private textAnimate(text: string, duration: number) {
    const { effect } = this.options;

    switch (effect) {
      case "typewriter":
        this.typewriter(text, duration);
        break;
      case "typewriteFadeIn":
        this.typewriteFadeIn(text, duration);
        break;
      case "fadeIn":
        this.fadeIn(text, duration);
        break;
      case "none":
        this.none(text);
        break;
    }
  }

  private typewriter(text: string, duration: number) {
    const fromText = this.text;
    const toText = fromText + text;

    this.tl.fromTo(
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
        duration,
        ease: "none",
      },
      this.duration,
    );
    this.text = toText;
  }

  private typewriteFadeIn(text: string, duration: number) {
    const fromText = this.text;
    const toText = fromText + text;
    const perCharDuration = duration / text.length;

    // 隐藏原始文本
    this.target.alpha = 0;

    const charList: PIXI.Text[] = [];
    // 获取文本内容和样式
    const style = this.target.style;

    // 使用 PIXI.TextMetrics 测量文本
    const metrics = PIXI.TextMetrics.measureText(toText, style);

    // 获取换行后的每一行
    const lines = metrics.lines;

    // 初始化 Y 坐标
    let currentY = this.target.y;

    // 遍历每行文本
    lines.forEach((line) => {
      // 初始化当前 X 坐标
      let currentX = this.target.x;

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
        charText.zIndex = this.target.zIndex;

        // 更新 X 坐标
        currentX += charMetrics.width;

        // 添加到场景
        this.stage.addChild(charText);
        charList.push(charText);
      }

      // 更新 Y 坐标
      currentY += metrics.lineHeight;
    });

    // 打字机渐入效果
    charList.forEach((char, index) => {
      if (index < fromText.length) {
        return;
      }

      this.tl.to(
        char,
        {
          alpha: 1,
          duration: 0.3,
          onComplete: () => {
            if (index === charList.length - 1) {
              charList.forEach((char) => {
                this.stage.removeChild(char);
                this.target.text = toText;
                this.target.alpha = 1;
              });
            }
          },
        },
        this.duration + index * perCharDuration,
      );
    });

    this.text = toText;
  }

  private fadeIn(text: string, duration: number) {
    const { effectDuration } = this.options;
    const fromText = this.text;
    const toText = fromText + text;

    this.tl.fromTo(
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
        duration: Math.min(effectDuration ?? 0.5, duration),
        ease: "none",
      },
      this.duration,
    );
    this.text = toText;
  }

  private none(text: string) {
    const fromText = this.text;
    const toText = fromText + text;

    this.tl.to(
      this.target,
      {
        pixi: {
          alpha: 1,
        },
        text: {
          value: toText,
        },
        duration: 0,
        ease: "none",
      },
      this.duration,
    );
    this.text = toText;
  }

  public getDuration(): number {
    const { sequential, interval } = this.options;
    let duration = this.duration;

    // 存在配音时，取文字和配音时长的最大值
    if (this.voiceDirective) {
      const voiceDuration = this.voiceDirective.getDuration();
      duration = Math.max(duration, voiceDuration);
    }

    // 增加说完一句后的停顿时间
    duration = duration + (interval ?? 0);

    return sequential ? duration : 0;
  }

  private readingTime(text: string, wordsPerMin = 500) {
    if (!text) {
      return 0;
    }

    return readingTime(text, { wordsPerMin }).seconds;
  }
}
