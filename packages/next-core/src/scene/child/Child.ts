import * as PIXI from "pixi.js";
import { Sprite } from "./Sprite";
import { Text } from "./Text";
import { Graphics } from "./Graphics";
import { Filter, reviveFilters } from "../filter";

export abstract class DisplayChild {
  public label: string = "";
  abstract clone(exact?: boolean): DisplayChild;
  abstract load(): Promise<void>;
  abstract toJSON(): AnyJSON;
}

export type Child = Sprite | Text | Graphics;

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
  to.visible = from.visible;
  to.alpha = from.alpha;
  if (!ignoreWH) {
    to.width = from.width;
    to.height = from.height;
  }
  to.setTransform(...getTransformArray(from));
  to.filters =
    from.filters?.map((item) => (item as Filter).clone(exact)) || null;
}

export function toJSON(child: Child) {
  return {
    __type: child.constructor.name,
    name: child.name,
    label: child.label,
    visible: child.visible,
    alpha: child.alpha,
    width: child.width,
    height: child.height,
    transform: getTransformArray(child),
    filters: child.filters?.map((item) => (item as Filter).toJSON()) || null,
  };
}

export async function copyFromJSON(from: AnyJSON, to: Child) {
  to.name = from.name;
  to.label = from.label;
  to.visible = from.visible;
  to.alpha = from.alpha;
  to.width = from.width;
  to.height = from.height;
  to.setTransform(from.transform);
  to.filters = await reviveFilters(from.filters);
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
