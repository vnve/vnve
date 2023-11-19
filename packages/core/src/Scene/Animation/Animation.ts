import * as PIXI from "pixi.js";
import { gsap } from "gsap";
import { PixiPlugin } from "gsap/PixiPlugin";
import { TextPlugin } from "./TextPlugin";

gsap.config({
  units: { time: "ms" },
});

gsap.registerPlugin(TextPlugin);
gsap.registerPlugin(PixiPlugin);
PixiPlugin.registerPIXI(PIXI);

export type AnimationParamsValue = [gsap.TweenVars, gsap.TweenVars];

export interface AnimationParam {
  name?: string;
  label?: string;
  value: AnimationParamsValue;
}
