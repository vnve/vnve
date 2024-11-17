import { DirectiveName } from "@vnve/core";

export enum DirectiveType {
  Animation = "Animation",
  Sound = "Sound",
  Util = "Util",
  Filter = "Filter",
  Transition = "Transition",
}

interface DirectiveNameOption {
  name: string;
  value: DirectiveName;
}

export const DirectiveNameMap: Record<DirectiveName, string> = {
  [DirectiveName.Speak]: "发言",
  [DirectiveName.Speaker]: "发言角色",
  [DirectiveName.ChangeSource]: "变更",
  [DirectiveName.Show]: "显示",
  [DirectiveName.Hide]: "隐藏",
  [DirectiveName.FadeIn]: "渐入",
  [DirectiveName.FadeOut]: "渐出",
  [DirectiveName.ShakeX]: "左右晃动",
  [DirectiveName.ShakeY]: "上下晃动",
  [DirectiveName.ZoomIn]: "放大",
  [DirectiveName.ZoomOut]: "缩小",
  [DirectiveName.EnterFromLeft]: "从左进入",
  [DirectiveName.LeaveFromLeft]: "向左离开",
  [DirectiveName.EnterFromRight]: "从右进入",
  [DirectiveName.LeaveFromRight]: "向右离开",
  [DirectiveName.Play]: "播放",
  [DirectiveName.Pause]: "暂停",
  [DirectiveName.Stop]: "停止",
  [DirectiveName.Wait]: "停顿",
  [DirectiveName.FadeInTransition]: "渐入转场",
  [DirectiveName.AddFilter]: "添加滤镜",
  [DirectiveName.RemoveFilter]: "移除滤镜",
};
export const AnimationDirectiveNameList: DirectiveName[] = [
  DirectiveName.ChangeSource,
  DirectiveName.Show,
  DirectiveName.Hide,
  DirectiveName.FadeIn,
  DirectiveName.FadeOut,
  DirectiveName.ShakeX,
  DirectiveName.ShakeY,
  DirectiveName.ZoomIn,
  DirectiveName.ZoomOut,
  DirectiveName.EnterFromLeft,
  DirectiveName.LeaveFromLeft,
  DirectiveName.EnterFromRight,
  DirectiveName.LeaveFromRight,
];

export const AnimationDirectiveNameOptions: DirectiveNameOption[] =
  AnimationDirectiveNameList.map((value) => ({
    name: DirectiveNameMap[value],
    value,
  }));

export const SoundDirectiveNameList: DirectiveName[] = [
  DirectiveName.Play,
  DirectiveName.Pause,
  DirectiveName.Stop,
];

export const SoundDirectiveNameOptions: DirectiveNameOption[] =
  SoundDirectiveNameList.map((value) => ({
    name: DirectiveNameMap[value],
    value,
  }));

export const UtilDirectiveNameList: DirectiveName[] = [DirectiveName.Wait];

export const FilterDirectiveNameList: DirectiveName[] = [
  DirectiveName.AddFilter,
  DirectiveName.RemoveFilter,
];

export const TransitionDirectiveNameList: DirectiveName[] = [
  DirectiveName.FadeInTransition,
];

export const UtilDirectiveNameOptions: DirectiveNameOption[] =
  UtilDirectiveNameList.map((value) => ({
    name: DirectiveNameMap[value],
    value,
  }));

export const FilterDirectiveNameOptions: DirectiveNameOption[] =
  FilterDirectiveNameList.map((value) => ({
    name: DirectiveNameMap[value],
    value,
  }));

export const TransitionDirectiveNameOptions: DirectiveNameOption[] =
  TransitionDirectiveNameList.map((value) => ({
    name: DirectiveNameMap[value],
    value,
  }));

export const DirectiveNameOptionGroups: Array<{
  name: string;
  type: DirectiveType;
  options: Array<DirectiveNameOption>;
}> = [
  {
    name: "动画指令",
    type: DirectiveType.Animation,
    options: AnimationDirectiveNameOptions,
  },
  {
    name: "音频指令",
    type: DirectiveType.Sound,
    options: SoundDirectiveNameOptions,
  },
  {
    name: "工具指令",
    type: DirectiveType.Util,
    options: UtilDirectiveNameOptions,
  },
  {
    name: "滤镜指令",
    type: DirectiveType.Filter,
    options: FilterDirectiveNameOptions,
  },
  {
    name: "转场指令",
    type: DirectiveType.Transition,
    options: TransitionDirectiveNameOptions,
  },
];

export function getDirectiveType(name: DirectiveName): DirectiveType {
  if (AnimationDirectiveNameList.includes(name)) {
    return DirectiveType.Animation;
  }

  if (SoundDirectiveNameList.includes(name)) {
    return DirectiveType.Sound;
  }

  if (UtilDirectiveNameList.includes(name)) {
    return DirectiveType.Util;
  }

  if (FilterDirectiveNameList.includes(name)) {
    return DirectiveType.Filter;
  }

  if (TransitionDirectiveNameList.includes(name)) {
    return DirectiveType.Transition;
  }
}

export const FilterOptions = [
  {
    name: "纯黑",
    value: "BlackMaskFilter",
  },
  {
    name: "模糊",
    value: "BlurFilter",
  },
  {
    name: "噪点",
    value: "NoiseFilter",
  },
  {
    name: "老电影",
    value: "OldFilmFilter",
  },
  {
    name: "暗角",
    value: "VignetteFilter",
  },
];
