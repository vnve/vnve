import * as PIXI from "pixi.js";
import { Sprite } from "./Sprite";
import { Text } from "./Text";
import { Graphics } from "./Graphics";
import { AnimatedGIF } from "./AnimatedGIF";
import { Video } from "./Video";
import { Filter, reviveFilters } from "../filter";

export abstract class DisplayChild {
  public declare label: string;
  public declare type: string;
  public abstract clone(exact?: boolean): DisplayChild;
  public abstract load(): Promise<void>;
  public abstract toJSON(): AnyJSON;
}

export type Child = Sprite | Text | Graphics | AnimatedGIF | Video;

export function copyTo(
  from: Child,
  to: Child,
  exact = false,
  ignoreWH = false,
) {
  if (exact) {
    to.name = from.name;
  }
  to.label = from.label;
  to.type = from.type;
  to.visible = from.visible;
  to.alpha = from.alpha;
  to.zIndex = from.zIndex;
  // 先设置 transform，再设置 width 和 height，避免 transform 间接影响到 width 和 height
  to.setTransform(...getTransformArray(from));
  if (!ignoreWH) {
    to.width = from.width;
    to.height = from.height;
  }
  to.filters =
    from.filters?.map((item) => (item as Filter).clone(exact)) || null;
}

export function toJSON(child: Child, ignoreWH = false) {
  let json: AnyJSON = {
    __type: child.type,
    name: child.name,
    label: child.label,
    type: child.type,
    visible: child.visible,
    alpha: child.alpha,
    zIndex: child.zIndex,
    transform: getTransformArray(child),
    filters: child.filters?.map((item) => (item as Filter).toJSON()) || null,
  };

  if (!ignoreWH) {
    json = {
      ...json,
      width: child.width,
      height: child.height,
    };
  }

  return json;
}

export async function copyFromJSON(from: AnyJSON, to: Child, ignoreWH = false) {
  to.name = from.name;
  to.label = from.label;
  to.type = from.type;
  to.visible = from.visible;
  to.alpha = from.alpha;
  to.zIndex = from.zIndex;
  to.setTransform(...from.transform);
  if (!ignoreWH) {
    if (typeof from.width === "number") {
      to.width = from.width;
    }
    if (typeof from.height === "number") {
      to.height = from.height;
    }
  }
  to.filters = await reviveFilters(from.filters);
}

/**
 * 当宽高与texture宽高一致时，说明没有自定义宽高，不需要复制宽高
 * 因为texture默认宽高为1,1，统一复制宽高可能会导致还原异常
 * 主要是在load未完成时，执行复制或者保存操作，宽高会被设置为1,1
 */
export function shouldIgnoreWH(child: Sprite | AnimatedGIF | Video) {
  return (
    child.width === child.texture.width &&
    child.height === child.texture.height &&
    child.width === 1 &&
    child.height === 1
  );
}

function getTransformArray(child: PIXI.DisplayObject) {
  return [
    child.x,
    child.y,
    child.scale.x,
    child.scale.y,
    child.rotation,
    child.skew.x,
    child.skew.y,
    child.pivot.x,
    child.pivot.y,
  ];
}
