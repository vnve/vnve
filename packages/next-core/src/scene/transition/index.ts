import { Transition } from "./Transition";
import { FadeInTransition } from "./FadeInTransition";
import { reviveList } from "../../util";

export { Transition, FadeInTransition };
export const TransitionClassMap: ClassMap = {
  FadeInTransition,
};
export function reviveTransition(json: AnyJSON): Promise<Transition[]> {
  return reviveList(TransitionClassMap, json);
}
