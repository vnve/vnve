import { DirectiveName } from "@vnve/next-core";

interface DirectiveNameOption {
  name: string;
  value: DirectiveName;
}

const DirectiveNameMap: Record<DirectiveName, string> = {
  Speak: "发言",
  Speaker: "发言人",
  ChangeSource: "变更状态",
  Show: "显示",
  Hide: "隐藏",
  FadeIn: "淡入",
  FadeOut: "淡出",
  Play: "播放",
  Pause: "暂停",
  Stop: "停止",
  Wait: "等待",
  FadeInTransition: "淡入过渡",
  AddFilter: "添加滤镜",
  RemoveFilter: "移除滤镜",
};
export const AnimationDirectiveNameList: DirectiveName[] = [
  "ChangeSource",
  "Show",
  "Hide",
  "FadeIn",
  "FadeOut",
];

export const AnimationDirectiveNameOptions: DirectiveNameOption[] =
  AnimationDirectiveNameList.map((value) => ({
    name: DirectiveNameMap[value],
    value,
  }));

export const SoundDirectiveNameList: DirectiveName[] = [
  "Play",
  "Pause",
  "Stop",
];

export const SoundDirectiveNameOptions: DirectiveNameOption[] =
  SoundDirectiveNameList.map((value) => ({
    name: DirectiveNameMap[value],
    value,
  }));

export const OtherDirectiveNameList: DirectiveName[] = [
  "Wait",
  "FadeInTransition",
  "AddFilter",
  "RemoveFilter",
];

export const OtherDirectiveNameOptions: DirectiveNameOption[] =
  OtherDirectiveNameList.map((value) => ({
    name: DirectiveNameMap[value],
    value,
  }));

export const DirectiveNameOptionGroups: Array<{
  name: string;
  options: Array<DirectiveNameOption>;
}> = [
  {
    name: "动画指令",
    options: AnimationDirectiveNameOptions,
  },
  {
    name: "声音指令",
    options: SoundDirectiveNameOptions,
  },
  {
    name: "其他指令",
    options: OtherDirectiveNameOptions,
  },
];
