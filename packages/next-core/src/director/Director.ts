import * as PIXI from "pixi.js";
import gsap from "gsap";
import { PixiPlugin } from "gsap/PixiPlugin";
import { TextPlugin } from "./lib/TextPlugin";
import * as Directives from "./directives";
import { Connector } from "../connector";
import { log, approximatelyEqual } from "../util";
import { soundController } from "./lib/SoundController";

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

export type DirectiveName =
  | "Speak"
  | "Speaker"
  | "Show"
  | "Hide"
  | "FadeIn"
  | "FadeOut"
  | "Wait"
  | "Play"
  | "Pause"
  | "Stop"
  | "ChangeSource"
  | "FadeInTransition"
  | "AddFilter"
  | "RemoveFilter";

export type DirectiveParams =
  | Directives.AnimationDirectiveOptions
  | Directives.SpeakDirectiveOptions
  | Directives.SpeakerDirectiveOptions
  | Directives.WaitDirectiveOptions
  | Directives.SoundDirectiveOptions
  | Directives.PlayDirectiveOptions
  | Directives.ChangeSourceDirectiveOptions
  | Directives.TransitionDirective
  | Directives.FilterDirectiveOptions
  | Directives.AddFilterDirectiveOptions;

export interface DirectiveConfig {
  directive: DirectiveName;
  params: DirectiveParams;
}

export interface SceneConfig {
  speak?: {
    target: {
      name?: string;
      text?: string;
      dialog?: string;
    };
    wordsPerMin?: number;
    interval?: number;
    effect?: string; // 播放效果, 打字机效果等
  };
  endInterval?: number;
}

export interface SceneScript {
  scene: PIXI.Container;
  directives: DirectiveConfig[];
  config?: SceneConfig; // TODO: 场景配置
}

export interface Screenplay {
  name?: string;
  config?: any; // 全局配置
  scenes: SceneScript[];
}

interface TickerExtend extends PIXI.Ticker {
  time: number;
  ctx: {
    scene?: PIXI.Container;
    imageSource?: CanvasImageSource;
    audioBuffers?: AudioBuffer[];
  };
  asyncHandlers: Array<Promise<void>>;
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
    this.ticker.asyncHandlers = [];
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
        // antialias: true,
        // resolution: window.devicePixelRatio ?? 1,
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

  public hasStarted() {
    return this.started;
  }

  // action!
  public async action(screenplay: Screenplay) {
    if (this.started) {
      return;
    }
    const now = performance.now();
    try {
      const duration = this.parseScreenplay(screenplay);

      this.registerUpdater();

      return await this.run(duration);
    } finally {
      this.reset();
      log.info("action cost:", performance.now() - now);
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
    soundController.reset();
    // hack ticker
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    let listener = this.ticker._head.next;

    while (listener) {
      listener = listener.destroy(true);
    }
    this.ticker.time = 0;
    this.ticker.lastTime = -1;
  }

  private parseScreenplay(screenplay: Screenplay): number {
    let duration = 0;
    const { scenes: sceneScripts } = screenplay;

    for (const sceneScript of sceneScripts) {
      duration = this.parseSceneScript(sceneScript, duration);
    }

    return duration;
  }

  private parseSceneScript(
    sceneScript: SceneScript,
    prevSceneDuration: number,
  ): number {
    const { config: sceneConfig, scene } = sceneScript;
    const { directives } = sceneScript;
    let duration = prevSceneDuration;

    // 初始化时，默认隐藏所有子元素
    scene.children.forEach((child) => {
      child.visible = false;
    });

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

      // 指令执行时机
      directive.executeTime = duration;

      this.ticker.add(() => {
        const time = this.ticker.time;

        // 当前时间
        directive.currentTime = time;

        // TODO: 时间精度
        if (
          approximatelyEqual(
            time,
            directive.executeTime,
            1 / (this.rendererOptions.fps * 2),
          )
        ) {
          log.debug(
            "execute directive:",
            directive,
            time,
            directive.executeTime,
          );
          this.ticker.asyncHandlers.push(directive.execute());
        }
      });

      duration += directive.getDuration();
    }

    // 场景结束间隔
    if (sceneConfig?.endInterval) {
      duration += sceneConfig.endInterval;
    }

    this.ticker.add(() => {
      const time = this.ticker.time;

      // TODO: 时间开闭区间问题
      if (
        time >= prevSceneDuration &&
        time <= duration &&
        this.ticker.ctx.scene !== scene
      ) {
        if (this.ticker.ctx.scene) {
          // 之前存在场景时，需要切换场景音频
          soundController.resetExceptUtilEnd();
        }

        // 切换场景
        this.ticker.ctx.scene = scene;
      }

      // TODO:待优化，当前场景结束后，可以清空当前场景注册的指令回调
      // if (time > duration) {
      // }
    });

    return duration;
  }

  private registerUpdater() {
    this.ticker.add(() => {
      const time = this.ticker.time;

      // 更新音频数据
      soundController.update(time, this.rendererOptions.fps);
      const updateAudioBuffers = async () => {
        this.ticker.ctx.audioBuffers = await soundController.getAudioBuffers();
      };
      this.ticker.asyncHandlers.push(updateAudioBuffers());

      // 动画ticker手动同步
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

    for (let frameIndex = 0; frameIndex <= frameCount; frameIndex++) {
      const frameTimeMS = (frameIndex / fps) * 1000;

      if (this.started) {
        this.ticker.time = frameTimeMS / 1000; // 拓展字段，记录当前tick的时间
        this.ticker.update(frameTimeMS); // 手动触发ticker更新

        // // 等待所有异步任务完成
        await Promise.all(this.ticker.asyncHandlers);

        if (this.connecter?.connection) {
          await this.connecter.handle({
            timestamp: frameTimeMS,
            imageSource: this.ticker.ctx.imageSource!,
            audioBuffers: this.ticker.ctx.audioBuffers!,
          });
        }
      } else {
        break;
      }
    }

    let result;

    if (this.started && this.connecter?.connection) {
      result = await this.connecter.finish();
    }

    this.started = false;

    return result;
  }
}