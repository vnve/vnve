import { Child } from "./Child";
import { Text } from "./Text";
import { Graphics } from "./Graphics";
import { Sprite } from "./Sprite";
import { reviveList } from "../../util";

export type { Child };
export { Text, Graphics, Sprite };
export const ChildClassMap: ClassMap = {
  Text,
  Graphics,
  Sprite,
};

export function reviveChildren(json: AnyJSON): Promise<Child[]> {
  return reviveList(ChildClassMap, json);
}
