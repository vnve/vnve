import { AnimationParamsValue } from ".";

export {
  Power0,
  Power1,
  Power2,
  Power3,
  Power4,
  Back,
  Bounce,
  Elastic,
} from "gsap";

/**
 * preset animations
 */
export const PREST_ANIMATION = {
  get In(): AnimationParamsValue {
    return [
      {
        pixi: {
          alpha: 0,
        },
      },
      {
        pixi: {
          alpha: 1,
        },
        duration: 1,
      },
    ];
  },
  get Out(): AnimationParamsValue {
    return [
      {
        pixi: {
          alpha: 1,
        },
      },
      {
        pixi: {
          alpha: 0,
        },
        duration: 1,
      },
    ];
  },
  get FadeOut(): AnimationParamsValue {
    return [
      {
        pixi: {
          alpha: 1,
        },
      },
      {
        pixi: {
          alpha: 0,
        },
        duration: 500,
      },
    ];
  },
  get FadeIn(): AnimationParamsValue {
    return [
      {
        pixi: {
          alpha: 0,
        },
      },
      {
        pixi: {
          alpha: 1,
        },
        duration: 500,
      },
    ];
  },
  get ShakeX(): AnimationParamsValue {
    return [
      {},
      {
        keyframes: {
          "0%": {},
          "10%": { x: "-=10%" },
          "20%": { x: "+=10%" },
          "30%": { x: "-=10%" },
          "40%": { x: "+=10%" },
          "50%": { x: "-=10%" },
          "60%": { x: "+=10%" },
          "70%": { x: "-=10%" },
          "80%": { x: "+=10%" },
          "90%": { x: "-=10%" },
          "100%": { x: "+=10%" },
        },
        duration: 1000,
      },
    ];
  },
  get ShakeY(): AnimationParamsValue {
    return [
      {},
      {
        keyframes: {
          "0%": {},
          "10%": { y: "-=10%" },
          "20%": { y: "+=10%" },
          "30%": { y: "-=10%" },
          "40%": { y: "+=10%" },
          "50%": { y: "-=10%" },
          "60%": { y: "+=10%" },
          "70%": { y: "-=10%" },
          "80%": { y: "+=10%" },
          "90%": { y: "-=10%" },
          "100%": { y: "+=10%" },
        },
        duration: 1000,
      },
    ];
  },
  get ZoomIn(): AnimationParamsValue {
    return [
      {
        pixi: {
          alpha: 0,
          scale: 0.7,
        },
      },
      {
        pixi: {
          alpha: 1,
          scale: 1,
        },
        duration: 1000,
      },
    ];
  },
  get ZoomOut(): AnimationParamsValue {
    return [
      {
        pixi: {
          alpha: 1,
          scale: 1,
        },
      },
      {
        pixi: {
          alpha: 0,
          scale: 0.7,
        },
        duration: 1000,
      },
    ];
  },
  get EnterFromLeft(): AnimationParamsValue {
    return [
      {
        pixi: {
          alpha: 0,
        },
      },
      {
        pixi: {
          alpha: 1,
        },
        keyframes: {
          "0%": { x: "-=100%" },
          "100%": { x: "+=100%" },
        },
        duration: 500,
      },
    ];
  },
  get EnterFromRight(): AnimationParamsValue {
    return [
      {
        pixi: {
          alpha: 0,
        },
      },
      {
        pixi: {
          alpha: 1,
        },
        keyframes: {
          "0%": { x: "+=100%" },
          "100%": { x: "-=100%" },
        },
        duration: 500,
      },
    ];
  },
  get EnterFromBottom(): AnimationParamsValue {
    return [
      {
        pixi: {
          alpha: 0,
        },
      },
      {
        pixi: {
          alpha: 1,
        },
        keyframes: {
          "0%": { y: "+=100%" },
          "100%": { y: "-=100%" },
        },
        duration: 500,
      },
    ];
  },
  get EnterFromTop(): AnimationParamsValue {
    return [
      {
        pixi: {
          alpha: 0,
        },
      },
      {
        pixi: {
          alpha: 1,
        },
        keyframes: {
          "0%": { y: "-=100%" },
          "100%": { y: "+=100%" },
        },
        duration: 500,
      },
    ];
  },
  get ExitFromLeft(): AnimationParamsValue {
    return [
      {
        pixi: {
          alpha: 1,
        },
      },
      {
        pixi: {
          alpha: 0,
        },
        keyframes: {
          "50%": { x: "-=50%" },
          "100%": { x: "-=100%" },
        },
        duration: 500,
      },
    ];
  },
  get ExitFromRight(): AnimationParamsValue {
    return [
      {
        pixi: {
          alpha: 1,
        },
      },
      {
        pixi: {
          alpha: 0,
        },
        keyframes: {
          "50%": { x: "+=50%" },
          "100%": { x: "+=100%" },
        },
        duration: 500,
      },
    ];
  },
  get ExitFromBottom(): AnimationParamsValue {
    return [
      {
        pixi: {
          alpha: 1,
        },
      },
      {
        pixi: {
          alpha: 0,
        },
        keyframes: {
          "50%": { y: "+=50%" },
          "100%": { y: "+=100%" },
        },
        duration: 500,
      },
    ];
  },
  get ExitFromTop(): AnimationParamsValue {
    return [
      {
        pixi: {
          alpha: 1,
        },
      },
      {
        pixi: {
          alpha: 0,
        },
        keyframes: {
          "50%": { y: "-=50%" },
          "100%": { y: "-=100%" },
        },
        duration: 500,
      },
    ];
  },
};
