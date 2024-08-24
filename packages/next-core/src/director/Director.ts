import * as PIXI from "pixi.js";
import gsap from "gsap";
import { PixiPlugin } from "gsap/PixiPlugin";
import { TextPlugin } from "./lib/TextPlugin";
import * as Directives from "./directives";
import { Connector } from "../connector";

// register the plugin
gsap.registerPlugin(PixiPlugin);
gsap.registerPlugin(TextPlugin);

// give the plugin a reference to the PIXI object
PixiPlugin.registerPIXI(PIXI);

//unhooks the GSAP ticker
gsap.ticker.remove(gsap.updateRoot);

interface RendererOptions {
  fps: number;
  width: number;
  height: number;
  background: number;
  renderer?: PIXI.IRenderer;
}

interface DirectiveItem {
  directive: "Speak" | "Show" | "Hide" | "FadeIn" | "FadeOut" | "Wait";
  params:
    | Directives.AnimationDirectiveOptions
    | Directives.SpeakDirectiveOptions
    | Directives.WaitDirectiveOptions;
}

interface SceneScript {
  scene: string;
  directives: DirectiveItem[];
  config?: {
    speak?: {
      wordsPerMin?: number;
      interval?: number;
      effect?: string; // 播放效果, 打字机效果等
    };
    endInterval?: number;
  }; // TODO: 场景配置
}

export interface Screenplay {
  name?: string;
  config?: any; // 全局配置
  scenes: SceneScript[];
}

// function wait(duration: number) {
//   return new Promise((resolve) => {
//     setTimeout(resolve, duration * 1000);
//   });
// }

interface TickerExtend extends PIXI.Ticker {
  ctx: {
    scene?: PIXI.Container;
    imageSource?: CanvasImageSource;
    audioBuffers?: AudioBuffer[];
  };
}

/**
 * 导演模块
 *
 * 1. 读入剧本解析，注册指令，解析执行
 * 2. 链接合成器或者预览器，输出的是帧画面和音频片段
 */
export class Director {
  private static defaultRendererOptions: RendererOptions = {
    fps: 30,
    width: 1920,
    height: 1080,
    background: 0x000000,
  };

  // https://github.com/pixijs/pixijs/blob/v7.3.2/packages/ticker/src/Ticker.ts
  private ticker: TickerExtend;
  private renderer: PIXI.IRenderer;
  private rendererOptions: RendererOptions;
  private started: boolean;
  private connecter?: Connector;

  constructor(rendererOptions?: Partial<RendererOptions>) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.ticker = PIXI.Ticker.shared; // 使用shared Ticker方便GIF,Video等插件共享
    this.ticker.ctx = {};
    this.ticker.autoStart = false;
    this.ticker.stop();
    this.rendererOptions = Object.assign(
      {},
      Director.defaultRendererOptions,
      rendererOptions,
    );
    this.started = false;

    const { width, height, background } = this.rendererOptions;
    this.renderer =
      this.rendererOptions.renderer ??
      PIXI.autoDetectRenderer({
        view: new OffscreenCanvas(width, height),
        width,
        height,
        background,
      });
  }

  public connect(connecter: Connector) {
    this.connecter = connecter;
    this.connecter.connect();
  }

  public disconnect() {
    this.connecter?.disconnect();
    this.connecter = undefined;
  }

  // read screenplay, ReadableStream Output
  // action!
  public async action(screenplay: Screenplay, scenes: PIXI.Container[]) {
    // TODO: lastTime = -1为第一帧，可以做些初始化操作，清空画布元素的状态，比如清空文字等
    try {
      const duration = this.parseScreenplay(screenplay, scenes);

      this.addCoreTickerCb();

      return await this.run(duration);
    } finally {
      this.reset();
    }
  }

  // cut!
  public cut() {
    this.started = false;
    // TODO: remove all listeners manually
    this.reset();
  }

  public reset() {
    this.started = false;
    this.ticker.lastTime = -1;
    // hack ticker
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    let listener = this.ticker._head.next;

    while (listener) {
      listener = listener.destroy(true);
    }
  }

  private parseScreenplay(
    screenplay: Screenplay,
    scenes: PIXI.Container[],
  ): number {
    let duration = 0;
    const { scenes: sceneScripts } = screenplay;

    for (const sceneScript of sceneScripts) {
      duration = this.parseSceneScript(sceneScript, scenes, duration);
    }

    return duration;
  }

  private parseSceneScript(
    sceneScript: SceneScript,
    scenes: PIXI.Container[],
    prevSceneDuration: number,
  ): number {
    const { config: sceneConfig, scene: sceneName, directives } = sceneScript;
    const scene = scenes.find((scene) => scene.name === sceneName)!;
    let duration = prevSceneDuration;

    // 注册指令
    for (const item of directives) {
      const { directive: directiveName, params } = item;
      const Directive = Directives[directiveName as keyof typeof Directives];

      if (!Directive) {
        console.error(`Directive ${directiveName} not found`);
        continue;
      }

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const directive = new Directive(params, scene, sceneConfig); // TODO: 增加场景默认配置

      directive.executeTime = duration;

      this.ticker.add(() => {
        const time = this.ticker.lastTime / 1000;

        // TODO: 时间精度
        if (
          time >= 0 &&
          this.approximatelyEqual(
            time,
            directive.executeTime,
            1 / (this.rendererOptions.fps * 2),
          )
        ) {
          console.log(
            "execute directive:",
            directive,
            time,
            directive.executeTime,
          );
          directive.execute();
        }
      });

      duration += directive.getDuration();
    }

    // 场景结束间隔
    if (sceneConfig?.endInterval) {
      duration += sceneConfig.endInterval;
    }

    // 切换场景
    this.ticker.add(() => {
      const time = this.ticker.lastTime / 1000;

      // TODO: 时间开闭区间问题
      if (time >= prevSceneDuration && time <= duration) {
        this.ticker.ctx.scene = scene;
      }
      // TODO:待优化，当前场景结束后，可以清空当前场景注册的指令回调
    });

    return duration;
  }

  private approximatelyEqual(a: number, b: number, tolerance: number) {
    return Math.abs(a - b) < tolerance;
  }

  private addCoreTickerCb() {
    this.ticker.add(() => {
      const time = this.ticker.lastTime / 1000;

      // 动画ticker手动同步绑定
      gsap.updateRoot(time);

      // 渲染当前的场景
      if (this.ticker.ctx.scene) {
        this.renderer.render(this.ticker.ctx.scene);
        this.ticker.ctx.imageSource = this.renderer.view as CanvasImageSource;
      }
    });
  }

  private async run(duration: number) {
    // 触发逐帧执行
    const { fps } = this.rendererOptions;
    const frameCount = duration * fps;

    this.started = true;

    // TODO:最后一帧的精度问题
    for (let frameIndex = 0; frameIndex <= frameCount + 1; frameIndex++) {
      const frameTimeMS = (frameIndex / fps) * 1000;
      console.log("frameTimeMS", frameTimeMS);

      // TODO: await this.ticker.ctx.asyncData

      if (this.started) {
        if (this.connecter?.connection) {
          await this.connecter.send({
            timestamp: frameTimeMS,
            imageSource: this.ticker.ctx.imageSource!,
            audioBuffers: this.ticker.ctx.audioBuffers!,
          });
        }

        this.ticker.update(frameTimeMS);
      } else {
        break;
      }
    }

    let result;

    if (this.connecter?.connection) {
      result = await this.connecter.finish();
    }

    this.started = false;

    return result;
  }
}
