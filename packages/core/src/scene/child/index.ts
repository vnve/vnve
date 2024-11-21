import { Child } from "./Child";
import { Text } from "./Text";
import { Graphics } from "./Graphics";
import { Sprite } from "./Sprite";
import { AnimatedGIF } from "./AnimatedGIF";
import { reviveList } from "../../util";
import { Video } from "./Video";

export type { Child };
export { Text, Graphics, Sprite, AnimatedGIF, Video };
export const ChildClassMap: ClassMap = {
  Text,
  Graphics,
  Sprite,
  AnimatedGIF,
  Video,
};

export function reviveChildren(json: AnyJSON): Promise<Child[]> {
  return reviveList(ChildClassMap, json);
}
