import {
  Converter,
  FadeInTransition,
  Graphics,
  Img,
  PREST_ANIMATION,
  Scene,
  Text,
} from "@vnve/core";
import { DialogueScene, MonologueScene, TitleScene } from "@vnve/template";
import placeholder from "../assets/image/placeholder.webp";

export const PRESET_ANIMATION_LIST = [
  {
    name: "FadeIn",
    label: "渐显",
    value: PREST_ANIMATION.FadeIn,
  },
  {
    name: "FadeOut",
    label: "渐隐",
    value: PREST_ANIMATION.FadeOut,
  },
  {
    name: "ShakeX",
    label: "左右晃动",
    value: PREST_ANIMATION.ShakeX,
  },
  {
    name: "ShakeY",
    label: "上下晃动",
    value: PREST_ANIMATION.ShakeY,
  },
  {
    name: "ZoomIn",
    label: "推近显示",
    value: PREST_ANIMATION.ZoomIn,
  },
  {
    name: "ZoomOut",
    label: "拉远隐藏",
    value: PREST_ANIMATION.ZoomOut,
  },
  {
    name: "EnterFromLeft",
    label: "从左进入",
    value: PREST_ANIMATION.EnterFromLeft,
  },
  {
    name: "EnterFromRight",
    label: "从右进入",
    value: PREST_ANIMATION.EnterFromRight,
  },
  {
    name: "EnterFromTop",
    label: "从上进入",
    value: PREST_ANIMATION.EnterFromTop,
  },
  {
    name: "EnterFromBottom",
    label: "从下进入",
    value: PREST_ANIMATION.EnterFromBottom,
  },
  {
    name: "ExitFromLeft",
    label: "从左离开",
    value: PREST_ANIMATION.ExitFromLeft,
  },
  {
    name: "ExitFromRight",
    label: "从右离开",
    value: PREST_ANIMATION.ExitFromRight,
  },
  {
    name: "ExitFromTop",
    label: "从上离开",
    value: PREST_ANIMATION.ExitFromTop,
  },
  {
    name: "ExitFromBottom",
    label: "从下离开",
    value: PREST_ANIMATION.ExitFromBottom,
  },
];

export const SCENE_TRANSITION_LIST = [
  {
    name: "FadeIn",
    label: "渐入",
    factory: () => {
      return new FadeInTransition({ duration: 500 });
    },
  },
];

export const SCENE_TEMPLATE_LIST = [
  {
    name: "对话场景",
    factory: () => {
      const dialogue = new DialogueScene({
        lines: [
          { name: "角色A", content: "角色A台词" },
          { name: "角色B", content: "角色B台词" },
        ],
      });

      return dialogue;
    },
  },
  {
    name: "独白场景",
    factory: () => {
      const monologueScene = new MonologueScene({
        lines: [{ content: "独白第一句" }, { content: "独白第二句" }],
      });

      return monologueScene;
    },
  },
  {
    name: "标题场景",
    factory: () => {
      const titleScene = new TitleScene({
        duration: 3000,
        title: "主标题",
        subtitle: "副标题",
      });

      return titleScene;
    },
  },
  {
    name: "自定义场景",
    factory: () => {
      const scene = new Scene({ duration: 3000 });

      return scene;
    },
  },
];

export const SCENE_CHILD_TEMPLATE_LIST = [
  {
    name: "文字元素",
    factory: () => {
      const text = new Text("文字");

      text.x = 300;
      text.y = 300;
      text.style.fill = "#ffffff";
      text.style.fontSize = 100;
      return text;
    },
  },
  {
    name: "图片元素",
    factory: () => {
      const img = new Img({ source: placeholder });
      img.load();

      return img;
    },
  },
  {
    name: "图形元素",
    factory: () => {
      const dialogRect = new Graphics();

      dialogRect.alpha = 0.7;
      dialogRect.beginFill(0x000000);
      dialogRect.drawRect(0, 0, Converter.width(1920), Converter.height(400));
      dialogRect.endFill();
      dialogRect.x = 0;
      dialogRect.y = Converter.y(680);

      return dialogRect;
    },
  },
];

export const SCENE_TYPE_NAME_MAP: { [_: string]: string } = {
  "": "自定义",
  TitleScene: "标题",
  MonologueScene: "独白",
  DialogueScene: "对话",
};

export const FONT_LIST = [
  {
    name: "Arial",
    value: "Arial",
  },
  {
    name: "微软雅黑",
    value: "Microsoft YaHei",
  },
  {
    name: "宋体",
    value: "SimSun",
  },
  {
    name: "黑体",
    value: "SimHei",
  },
  {
    name: "思源黑体",
    value: "Source Han Sans CN",
  },
  {
    name: "苹方",
    value: "PingFang SC",
  },
  {
    name: "Courier New",
    value: "Courier New",
  },
];

export const LINE_DISPLAY_EFFECT_OPTIONS = [
  {
    name: "打字机",
    value: "typewriter",
  },
  {
    name: "渐入",
    value: "fadeIn",
  },
  {
    name: "无",
    value: "none",
  },
];

export type BrowserEnvSupportType =
  | "fullSupport"
  | "onlyVideoSupport"
  | "notSupport"
  | "checkingEnv";
