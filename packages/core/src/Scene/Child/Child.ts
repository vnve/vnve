import { AnimationParam, AnimationParamsValue } from "../Animation";

export class Child {
  public type?: string;
  public animationParams?: AnimationParam[];

  public addAnimation(animationParam: AnimationParam | AnimationParamsValue) {
    if (!this.animationParams) {
      this.animationParams = [];
    }

    if (Array.isArray(animationParam)) {
      // input AnimationParamsValue
      this.animationParams.push({ value: animationParam });
    } else {
      this.animationParams.push(animationParam);
    }
  }

  public removeAnimationByIndex(index: number) {
    this.animationParams?.splice(index, 1);
  }

  public removeAllAnimation() {
    this.animationParams = [];
  }
}
