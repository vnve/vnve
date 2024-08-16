import * as PIXI from "pixi.js";
import { Child } from "./Child";
import { applyMixins } from "./Mixin";
import { cloneDeep } from "lodash-es";
import { Filter } from "..";
import { getTransformArray, reviveFilters, uuid } from "../../Utils";

export class Graphics extends PIXI.Graphics {
  public uuid = uuid();
  public type = "Graphics";

  public cloneSelf() {
    const cloned = new Graphics(this.clone().geometry);

    cloned.name = this.name;
    cloned.uuid = this.uuid;
    cloned.alpha = this.alpha;
    cloned.visible = this.visible;
    cloned.setTransform(...getTransformArray(this));
    cloned.width = this.width;
    cloned.height = this.height;
    cloned.animationParams = cloneDeep(this.animationParams);
    cloned.filters =
      this.filters?.map((item) => (item as Filter).cloneSelf()) || null;

    return cloned;
  }

  public toJSON() {
    return {
      __type: "Graphics",
      name: this.name,
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
      uuid: this.uuid,
      alpha: this.alpha,
      width: this.width,
      height: this.height,
      transform: getTransformArray(this),
      animationParams: this.animationParams,
      filters: this.filters,
    };
  }

  static fromJSON(raw: any) {
    const geometry = new PIXI.GraphicsGeometry();
    geometry.graphicsData = raw.graphicsData.map((item: any) => {
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

    graphics.name = raw.name;
    graphics.uuid = raw.uuid;
    graphics.alpha = raw.alpha;
    graphics.setTransform(...raw.transform);
    graphics.width = raw.width;
    graphics.height = raw.height;
    graphics.animationParams = raw.animationParams;
    graphics.filters = reviveFilters(raw.filters);

    return graphics;
  }
}

export interface Graphics extends PIXI.Graphics, Child {}
applyMixins(Graphics, [Child]);
