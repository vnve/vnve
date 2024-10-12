import * as PIXI from "pixi.js";
import { DisplayChild, copyFromJSON, copyTo, toJSON } from "./Child";
import { uuid } from "../../util";

export class Graphics extends PIXI.Graphics implements DisplayChild {
  public name = uuid();
  public label = "";
  public type = "Graphics";
  public fillColor = ""; // 用于存储颜色值，仅给选择器展示使用

  public async load() {
    // noop
  }

  public clone(exact = false) {
    const cloned = new Graphics(super.clone().geometry);

    copyTo(this, cloned, exact);

    cloned.fillColor = this.fillColor;

    return cloned;
  }

  public toJSON() {
    return {
      ...toJSON(this),
      fillColor: this.fillColor,
      graphicsData: this.geometry.graphicsData.map((item) => {
        return [
          item.shape,
          {
            ...item.fillStyle,
            texture: undefined,
          },
          {
            ...item.lineStyle,
            texture: undefined,
          },
          // item.matrix,
        ];
      }),
    };
  }

  static async fromJSON(json: AnyJSON) {
    const geometry = new PIXI.GraphicsGeometry();
    geometry.graphicsData = json.graphicsData.map((item: AnyJSON) => {
      const shape = new PIXI.Rectangle(); // hard code Rect

      shape.x = item[0].x;
      shape.y = item[0].y;
      shape.width = item[0].width;
      shape.height = item[0].height;

      const fillStyle = new PIXI.FillStyle();
      fillStyle.alpha = item[1].alpha;
      fillStyle.color = item[1].color;
      // fillStyle.matrix = item[1].matrix;
      fillStyle.visible = item[1].visible;

      const lineStyle = new PIXI.LineStyle();
      lineStyle.color = item[2].color;
      lineStyle.alpha = item[2].alpha;
      // lineStyle.matrix = item[2].matrix;
      lineStyle.visible = item[2].visible;
      lineStyle.width = item[2].width;
      lineStyle.alignment = item[2].alignment;
      lineStyle.native = item[2].native;
      lineStyle.cap = item[2].cap;
      lineStyle.join = item[2].join;
      lineStyle.miterLimit = item[2].miterLimit;

      // const matrix = item[3];

      return new PIXI.GraphicsData(shape, fillStyle, lineStyle);
    });
    const graphics = new Graphics(geometry);

    await copyFromJSON(json, graphics);

    graphics.fillColor = json.fillColor;

    return graphics;
  }
}
