/**
 * modify from https://github.com/greensock/GSAP/blob/master/src/TextPlugin.js
 */
/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
export const TextPlugin = {
  version: "3.12.2",
  name: "text",
  init(target, value, tween) {
    typeof value !== "object" && (value = { value: value });
    let text = value.value;

    this.startText = tween.vars?.startAt?.text?.value || "";
    this.target = target;

    if (this.startText) {
      text = text.replace(this.startText, "");
    }

    text = text.split("");
    this.from = tween._from;

    this.text = text;
    this._props.push("text");
  },
  render(ratio, data) {
    if (ratio > 1) {
      ratio = 1;
    } else if (ratio < 0) {
      ratio = 0;
    }
    if (data.from) {
      ratio = 1 - ratio;
    }
    const { text, target, startText } = data,
      l = text.length,
      i = (ratio * l + 0.5) | 0;

    target.text = startText + text.slice(0, i).join("");
  },
};
