import * as PIXI from "pixi.js";
import { createDialogueScene } from "../template";

export class Game {
  public app: PIXI.Application;
  /**
   * 剧本
   */
  public screenplay: string;
  /**
   * 大模型预设提示词
   */
  public preset: string;

  constructor({ view }: { view: HTMLCanvasElement }) {
    this.app = new PIXI.Application({
      view,
      width: 1920,
      height: 1080,
      backgroundColor: 0x000000,
    });
    this.screenplay = "";
    this.preset = "";
  }

  public play(nextAction: string) {
    // 1. 输入下一步操作
    // 2. 请求大模型接口
    // 3. 解析返回结果，画布展示
    // 4. 储存剧本
    const scene = createDialogueScene();

    this.app.stage.addChild(scene);
  }

  public exportScenes() {
    // 把剧本转换成场景
  }

  private requestLLM() {
    // 请求大模型
  }

  private parseLLMResponse() {
    // 解析大模型返回值，实时展示在画布上
  }
}
