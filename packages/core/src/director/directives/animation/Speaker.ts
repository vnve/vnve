import * as PIXI from "pixi.js";
import { AnimationDirective, AnimationDirectiveOptions } from "../base";
import { Show } from "./Show";
import { FadeIn } from "./FadeIn";
import { BlackMaskFilter, Filter, Sprite } from "../../../scene";
import { merge } from "lodash-es";

const AUTO_MASK_FILTER_NAME = "AutoMaskFilter";
const InAnimationDirectiveClassMap = {
  Show,
  FadeIn,
};
export interface AutoShowSpeakerOptions extends AnimationDirectiveOptions {
  inEffect?: "Show" | "FadeIn";
}

export interface AutoMaskOtherSpeakersOptions {
  alpha?: number;
}

export interface SpeakerDirectiveOptions extends AnimationDirectiveOptions {
  /**
   * 发言角色展示名称
   */
  name: string;
  /**
   * 发言角色立绘的targetName
   */
  speakerTargetName?: string;
  autoShowSpeaker?: Omit<AutoShowSpeakerOptions, "targetName">;
  autoMaskOtherSpeakers?: AutoMaskOtherSpeakersOptions;
}

export class Speaker extends AnimationDirective<PIXI.Text> {
  protected declare options: SpeakerDirectiveOptions;
  protected speakerTarget?: PIXI.DisplayObject | null;

  constructor(options: SpeakerDirectiveOptions, stage: PIXI.Container) {
    super(options, stage);
    this.options = merge(
      {
        autoShowSpeaker: {
          inEffect: "Show",
        },
        autoMaskOtherSpeakers: {
          alpha: 0.5,
        },
      },
      options,
    );
    const { speakerTargetName } = this.options;

    if (speakerTargetName) {
      this.speakerTarget = this.stage.getChildByName(speakerTargetName);
    }
  }

  public execute() {
    const { name, autoShowSpeaker, autoMaskOtherSpeakers, executeTime } =
      this.options;

    if (this.target) {
      this.target.visible = true;
      this.target.text = name;
    }

    // 如果已经展示，则无需重复执行入场动画
    if (autoShowSpeaker && this.speakerTarget && !this.speakerTarget.visible) {
      const { inEffect = "Show" } = autoShowSpeaker;
      const InDirectiveClass = InAnimationDirectiveClassMap[inEffect];

      new InDirectiveClass(
        {
          ...autoShowSpeaker,
          executeTime,
          targetName: this.speakerTarget.name!,
        },
        this.stage,
      ).execute();
    }

    // 自动对其他角色进行遮罩
    // 1. 假如Speaker存在遮罩，去除Speaker的遮罩
    // 2. 假如其他元素没有遮罩，自动加上遮罩
    if (autoMaskOtherSpeakers) {
      const { alpha = 0.5 } = autoMaskOtherSpeakers;

      if (this.speakerTarget && this.checkMaskFilter(this.speakerTarget)) {
        this.removeMaskFilter(this.speakerTarget);
      }

      this.stage.children.forEach((child) => {
        if (
          child !== this.speakerTarget &&
          (child as Sprite).assetType === "Character"
        ) {
          if (!this.checkMaskFilter(child)) {
            this.addMaskFilter(child, alpha);
          }
        }
      });
    }
  }

  private checkMaskFilter(target: PIXI.DisplayObject) {
    return target.filters?.some(
      (filter) => (filter as Filter).name === AUTO_MASK_FILTER_NAME,
    );
  }

  private removeMaskFilter(target: PIXI.DisplayObject) {
    target.filters =
      target.filters?.filter(
        (filter) => (filter as Filter).name !== AUTO_MASK_FILTER_NAME,
      ) || [];
  }

  private addMaskFilter(target: PIXI.DisplayObject, alpha: number) {
    const filter = new BlackMaskFilter();
    filter.name = AUTO_MASK_FILTER_NAME;
    filter.alpha = alpha;

    if (target.filters) {
      target.filters.push(filter);
    } else {
      target.filters = [filter];
    }
  }
}
