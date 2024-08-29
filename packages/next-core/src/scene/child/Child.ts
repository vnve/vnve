import * as PIXI from "pixi.js";
import { Sprite } from "./Sprite";
import { Text } from "./Text";
import { Graphics } from "./Graphics";
import { Filter, reviveFilters } from "../filter";

export abstract class DisplayChild {
  public label: string = "";
  abstract load(): Promise<void>;
  abstract toJSON(): AnyJSON;
}

export { Sprite, Text, Graphics };
export type Child = Sprite | Text | Graphics;

export function copyTo(from: Child, to: Child) {
  to.label = from.label;
  to.visible = from.visible;
  to.alpha = from.alpha;
  to.width = from.width; // TODO: Text should not clone ?
  to.height = from.height;
  to.setTransform(...getTransformArray(from));
  to.filters = from.filters?.map((item) => (item as Filter).clone()) || null;
}

export function toJSON(child: Child) {
  return {
    __type: child.constructor.name,
    name: child.name,
    label: child.label,
    visible: child.visible,
    alpha: child.alpha,
    transform: getTransformArray(child),
    filters: child.filters?.map((item) => (item as Filter).toJSON()) || null,
  };
}

export function copyFromJSON(from: AnyJSON, to: Child) {
  to.name = from.name;
  to.label = from.label;
  to.visible = from.visible;
  to.alpha = from.alpha;
  to.width = from.width;
  to.height = from.height;
  to.setTransform(from.transform);
  to.filters = reviveFilters(from.filters);
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

const ChildClassMap: ClassMap = {
  Text,
  Sprite,
  Graphics,
};

export async function reviveChildren(childrenJSON: AnyJSON) {
  const children = [];

  for (const json of childrenJSON) {
    const ChildClass = ChildClassMap[json.__type];
    const child = await ChildClass.fromJSON(json);

    children.push(child);
  }

  return children;
}
