import * as PIXI from "pixi.js";
import { Sprite } from "./Sprite";
import { Text } from "./Text";
import { Graphics } from "./Graphics";
import { Filter, reviveFilters } from "../filter";

export abstract class DisplayChild {
  abstract label: string;
  abstract type: string;
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
  to.type = from.type;
  to.visible = from.visible;
  to.alpha = from.alpha;
  to.zIndex = from.zIndex;
  if (!ignoreWH) {
    to.width = from.width;
    to.height = from.height;
  }
  to.setTransform(...getTransformArray(from));
  to.filters =
    from.filters?.map((item) => (item as Filter).clone(exact)) || null;
}

export function toJSON(child: Child, ignoreWH = false) {
  let json: AnyJSON = {
    __type: child.constructor.name,
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
  if (!ignoreWH) {
    if (typeof from.width === "number") {
      to.width = from.width;
    }
    if (typeof from.height === "number") {
      to.height = from.height;
    }
  }
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
