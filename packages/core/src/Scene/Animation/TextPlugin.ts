/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
export const TextPlugin = {
  version: "3.12.2",
  name: "text",
  init(target, value, tween) {
    typeof value !== "object" && (value = { value: value });
    let text = value.value;

    this.target = target;
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
    const { text, target } = data,
      l = text.length,
      i = (ratio * l + 0.5) | 0;

    target.text = text.slice(0, i).join("");
  },
};
