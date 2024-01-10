import {
  BlackMaskFilter,
  BlurFilter,
  Converter,
  FadeInTransition,
  Graphics,
  Img,
  NoiseFilter,
  OldFilmFilter,
  PREST_ANIMATION,
  Scene,
  Text,
  VignetteFilter,
} from "@vnve/core";
import { DialogueScene, MonologueScene, TitleScene } from "@vnve/template";
import placeholder from "../assets/image/placeholder.webp";

let defaultWordsPerMinute;
let defaultLineDisplayEffect;

export function setDefaultWordsPerMinute(wordsPerMinute: number) {
  defaultWordsPerMinute = wordsPerMinute;
}

export function getDefaultWordsPerMinute() {
  return defaultWordsPerMinute;
}

export function setDefaultLineDisplayEffect(lineDisplayEffect: string) {
  defaultLineDisplayEffect = lineDisplayEffect;
}

export function getDefaultLineDisplayEffect() {
  return defaultLineDisplayEffect;
}

export const PRESET_FILTER_LIST = [
  {
    name: "BlurFilter",
    label: "模糊",
    factory: () => {
      return new BlurFilter();
    },
  },
  {
    name: "BlackMaskFilter",
    label: "纯黑",
    factory: () => {
      return new BlackMaskFilter();
    },
  },
  {
    name: "VignetteFilter",
    label: "暗角",
    factory: () => {
      return new VignetteFilter();
    },
  },
  {
    name: "OldFilmFilter",
    label: "老电影",
    factory: () => {
      return new OldFilmFilter();
    },
  },
  {
    name: "NoiseFilter",
    label: "噪点",
    factory: () => {
      return new NoiseFilter();
    },
  },
];

export const PRESET_ANIMATION_LIST = [
  {
    name: "In",
    label: "显示",
    value: PREST_ANIMATION.In,
  },
  {
    name: "Out",
    label: "隐藏",
    value: PREST_ANIMATION.Out,
  },
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
        wordsPerMinute: getDefaultWordsPerMinute(),
        lineDisplayEffect: getDefaultLineDisplayEffect(),
      });

      return dialogue;
    },
  },
  {
    name: "独白场景",
    factory: () => {
      const monologueScene = new MonologueScene({
        lines: [{ content: "独白第一句" }, { content: "独白第二句" }],
        wordsPerMinute: getDefaultWordsPerMinute(),
        lineDisplayEffect: getDefaultLineDisplayEffect(),
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

export const imgEditorZhTransitions = {
  name: "名称",
  save: "保存",
  saveAs: "另存为",
  back: "返回",
  apply: "应用",
  loading: "正在加载...",
  discardChanges: "放弃更改",
  resetOperations: "重置/删除所有操作",
  changesLoseConfirmation: "所有更改都将丢失",
  changesLoseConfirmationHint: "您确定要继续吗？",
  cancel: "取消",
  confirm: "确定",
  continue: "继续",
  undoTitle: "撤消上一个操作",
  redoTitle: "重做上次操作",
  showImageTitle: "显示原始图像",
  zoomInTitle: "放大",
  zoomOutTitle: "缩小",
  toggleZoomMenuTitle: "切换缩放菜单",
  adjustTab: "调整",
  finetuneTab: "微调",
  filtersTab: "滤镜",
  watermarkTab: "水印",
  annotateTab: "绘制",
  resize: "调整大小",
  resizeTab: "调整大小",
  invalidImageError: "提供的图像无效",
  uploadImageError: "上传图像时出错",
  areNotImages: "不是图片",
  isNotImage: "不是图片",
  toBeUploaded: "待上传",
  cropTool: "裁剪",
  original: "原件",
  custom: "自定义",
  square: "正方形",
  landscape: "风景",
  portrait: "肖像",
  ellipse: "椭圆",
  classicTv: "经典电视",
  cinemascope: "电影镜",
  arrowTool: "箭头",
  blurTool: "模糊",
  brightnessTool: "亮度",
  contrastTool: "对比",
  ellipseTool: "椭圆",
  unFlipX: "解除翻转 X",
  flipX: "翻转 X",
  unFlipY: "解除翻转 Y",
  flipY: "翻转 Y",
  hsvTool: "HSV",
  hue: "色相",
  saturation: "饱和度",
  value: "值",
  imageTool: "图像",
  importing: "正在导入..",
  addImage: "+ 添加图像",
  lineTool: "线",
  penTool: "笔",
  polygonTool: "多边形",
  sides: "侧面",
  rectangleTool: "矩形",
  cornerRadius: "角半径",
  resizeWidthTitle: "宽度（以像素为单位）",
  resizeHeightTitle: "高度（以像素为单位）",
  toggleRatioLockTitle: "切换比率锁定",
  reset: "重置",
  resetSize: "重置为原始图像大小",
  rotateTool: "旋转",
  textTool: "文本",
  textSpacings: "文本间距",
  textAlignment: "文本对齐方式",
  fontFamily: "字体系列",
  size: "尺寸",
  letterSpacing: "字母间距",
  lineHeight: "行高",
  warmthTool: "色温",
  addWatermark: "+  添加水印",
  addWatermarkTitle: "选择水印类型",
  uploadWatermark: "上传水印",
  addWatermarkAsText: "添加为文本",
  padding: "填充",
  shadow: "影子",
  horizontal: "水平",
  vertical: "垂直",
  blur: "模糊",
  opacity: "不透明度",
  position: "位置",
  stroke: "描边",
  saveAsModalLabel: "将图像另存为",
  extension: "扩展",
  nameIsRequired: "名称为必填项",
  quality: "质量",
  imageDimensionsHoverTitle: "保存的图像大小（宽 x 高）",
  cropSizeLowerThanResizedWarning:
    "请注意，所选裁剪区域低于应用的调整大小，这可能会导致质量下降",
  actualSize: "实际大小 （100%）",
  fitSize: "适合尺寸",
  changesLoseWarningHint:
    '如果您按下 "重置 "按钮，您所做的更改将丢失。您还想继续吗？',
  discardChangesWarningHint: "如果关闭，则不会保存最后的更改。",
  warning: "警告",
  annotateTabLabel: "标注",
  imageName: "图片名称",
  uploadImage: "上传图片",
  brightness: "亮度",
  paddings: "填充",
  transparency: "透明度",
  saveAsModalTitle: "保存为",
  addImageTitle: "选择要添加的图像...",
  mutualizedFailedToLoadImg: "加载图像失败",
  format: "格式",
  tabsMenu: "菜单",
  download: "下载",
  width: "宽度",
  height: "高度",
  plus: "+",
  cropItemNoEffect: "该裁剪无预览",
};
