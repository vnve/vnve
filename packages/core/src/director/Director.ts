import * as PIXI from "pixi.js";
import gsap from "gsap";
import { PixiPlugin } from "gsap/PixiPlugin";
import { TextPlugin } from "./lib/TextPlugin";
import * as Directives from "./directives";
import { Connector } from "../connector";
import { log, approximatelyEqual } from "../util";
import { soundController } from "./lib/SoundController";
import { Scene } from "../scene";

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
  onProgress?: (progress: number, currentTime: number) => void;
}

export enum DirectiveName {
  ChangeSource = "ChangeSource",
  Speak = "Speak",
  Speaker = "Speaker",
  Show = "Show",
  Hide = "Hide",
  FadeIn = "FadeIn",
  FadeOut = "FadeOut",
  ShakeX = "ShakeX",
  ShakeY = "ShakeY",
  ZoomIn = "ZoomIn",
  ZoomOut = "ZoomOut",
  EnterFromLeft = "EnterFromLeft",
  LeaveFromLeft = "LeaveFromLeft",
  EnterFromRight = "EnterFromRight",
  LeaveFromRight = "LeaveFromRight",
  Wait = "Wait",
  Play = "Play",
  Pause = "Pause",
  Stop = "Stop",
  FadeInTransition = "FadeInTransition",
  AddFilter = "AddFilter",
  RemoveFilter = "RemoveFilter",
}

export type DirectiveParams =
  | Directives.AnimationDirectiveOptions
  | Directives.SpeakDirectiveOptions
  | Directives.SpeakerDirectiveOptions
  | Directives.WaitDirectiveOptions
  | Directives.SoundDirectiveOptions
  | Directives.PlayDirectiveOptions
  | Directives.ChangeSourceDirectiveOptions
  | Directives.TransitionDirectiveOptions
  | Directives.FilterDirectiveOptions
  | Directives.AddFilterDirectiveOptions;

export interface DirectiveConfig {
  directive: DirectiveName;
  params: DirectiveParams;
}

export interface SceneConfig {
  speak: Omit<Directives.SpeakDirectiveOptions, "lines"> & {
    speaker: Directives.SpeakerDirectiveOptions;
  };
  /**
   * 自动展示背景
   */
  autoShowBackground?: boolean;
}

export interface SceneScript {
  scene: Scene;
  directives: DirectiveConfig[];
  config: SceneConfig;
  preload?: Promise<void>;
}

interface SceneScriptExecutor {
  frameCount: number;
  install: () => () => void;
}

export interface Screenplay {
  name?: string;
  config?: unknown; // TODO: 待补充全局配置
  scenes: SceneScript[];
}

interface TickerExtend extends PIXI.Ticker {
  time: number;
  globalTime: number;
  ctx: {
    scene?: PIXI.Container;
    imageSource?: CanvasImageSource;
    audioBuffers?: AudioBuffer[];
  };
  asyncHandlers: Array<Promise<void>>;
}

interface Subtitle {
  start: number;
  end: number;
  text: string;
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
  private subtitles: Subtitle[];
  private connecter?: Connector;
  private cutResolver?: (value: unknown) => void;

  constructor(rendererOptions?: Partial<RendererOptions>) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.ticker = PIXI.Ticker.shared; // 使用shared Ticker方便GIF,Video等插件共享
    this.ticker.ctx = {};
    this.ticker.globalTime = 0;
    this.ticker.asyncHandlers = [];
    this.ticker.autoStart = false;
    this.ticker.stop();
    this.rendererOptions = Object.assign(
      {},
      Director.defaultRendererOptions,
      rendererOptions,
    );
    this.started = false;
    this.subtitles = [];

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
      return await this.run(screenplay);
    } catch (error) {
      log.error("Error running screenplay:", error);
      throw error;
    } finally {
      this.reset();
      log.info("action cost:", performance.now() - now);
      if (this.cutResolver) {
        this.cutResolver(true);
        this.cutResolver = undefined;
      }
    }
  }

  // cut!
  public cut() {
    return new Promise((resolve) => {
      this.started = false;
      this.cutResolver = resolve;
    });
  }

  public reset() {
    this.started = false;
    this.subtitles = [];
    soundController.reset();
    // hack ticker
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    let listener = this.ticker._head.next;

    while (listener) {
      listener = listener.destroy(true);
    }
    this.ticker.time = 0;
    this.ticker.globalTime = 0;
    this.ticker.lastTime = -1;
    this.ticker.ctx = {};
    this.ticker.asyncHandlers = [];
  }

  private async parseSceneScript(
    sceneScript: SceneScript,
  ): Promise<SceneScriptExecutor> {
    // Update return type to Promise<SceneScriptExecutor>
    const { scene } = sceneScript;
    const { directives } = sceneScript;
    let nextDirectiveStart = 0;
    const directiveExecutors: Array<() => void> = [];

    // 如果有预加载，等待预加载完成
    if (sceneScript.preload) {
      await sceneScript.preload;
    } else {
      await scene.load();
    }

    // 初始化时，默认隐藏所有子元素
    scene.children.forEach((child) => {
      child.visible = false;
    });

    const install = () => {
      log.debug("switch scene exec:", this.ticker.time);
      // 全局实例重置为0，否则重复执行时动画异常
      gsap.updateRoot(0);
      // 切换场景音频，清除非跨场景的音频
      soundController.resetExceptUtilEnd();
      // 切换场景
      this.ticker.ctx.scene = scene;
      // 注册指令执行器
      directiveExecutors.forEach((executor) => {
        this.ticker.add(executor);
      });

      const frameUpdater = () => {
        const time = this.ticker.time;

        // 更新音频数据
        soundController.update(time, this.rendererOptions.fps);
        const updateAudioBuffers = async () => {
          this.ticker.ctx.audioBuffers =
            await soundController.getAudioBuffers();
        };
        this.ticker.asyncHandlers.push(updateAudioBuffers());

        // 动画ticker手动同步
        gsap.updateRoot(time);

        // 渲染当前的场景
        if (this.ticker.ctx.scene) {
          this.renderer.render(this.ticker.ctx.scene);
          this.ticker.ctx.imageSource = this.renderer.view as CanvasImageSource;
        }
      };

      this.ticker.add(frameUpdater);

      return () => {
        this.ticker.remove(frameUpdater);
        this.ticker.time = 0;
        this.ticker.lastTime = -1;
        this.ticker.ctx = {};
        this.ticker.asyncHandlers = [];
      };
    };

    for (const item of directives) {
      const { directive: directiveName, params } = item;
      const Directive = Directives[directiveName as keyof typeof Directives];

      if (!Directive) {
        log.error(`Directive ${directiveName} not found`);
        continue;
      }

      // 指令执行时机
      const executeTime = nextDirectiveStart;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const directive = new Directive(
        {
          ...params,
          executeTime,
        },
        scene,
      );

      if (!directive.check()) {
        throw {
          type: "custom",
          message: "directive check failed",
          errorSceneName: scene.label,
          errorDirectiveName: directiveName,
        };
      }

      // 针对需要加载资源的指令，提前加载完成，才能执行
      if (directive.load) {
        await directive.load();
      }

      const directiveExecutor = () => {
        const { time, globalTime } = this.ticker;

        // 当前时间
        directive.currentTime = time;

        if (
          approximatelyEqual(
            time,
            directive.executeTime,
            1 / this.rendererOptions.fps,
          )
        ) {
          log.debug(
            "execute directive:",
            directive,
            time - directive.executeTime,
          );
          this.ticker.asyncHandlers.push(directive.execute());
          // 指令执行完成后移除
          this.ticker.remove(directiveExecutor);

          // 执行Speak指令时，记录字幕
          if (directiveName === "Speak") {
            this.subtitles.push({
              start: globalTime,
              end: globalTime + directive.getDuration(),
              text: directive.options.text,
            });
          }
        }
      };
      directiveExecutors.push(directiveExecutor);

      nextDirectiveStart += directive.getDuration();
    }

    const { fps } = this.rendererOptions;
    const duration = nextDirectiveStart;
    const frameCount = Math.ceil(duration * fps);

    return {
      frameCount,
      install,
    };
  }

  private async run(screenplay: Screenplay) {
    const { fps } = this.rendererOptions;
    const { scenes: sceneScripts } = screenplay;
    let frameIndex = 0;

    this.started = true;

    // 按照场景顺序，触发逐帧执行
    for (const [sceneIndex, sceneScript] of sceneScripts.entries()) {
      // 解析场景脚本，并加载资源
      const sceneScriptExecutor = await this.parseSceneScript(sceneScript);

      // 预加载下一个场景资源
      const nextSceneScript = sceneScripts[sceneIndex + 1];
      if (nextSceneScript) {
        nextSceneScript.preload = nextSceneScript.scene.load();
      }

      // 执行切换场景, 并注册指令执行器
      const uninstall = sceneScriptExecutor.install();
      const sceneFrameCount = sceneScriptExecutor.frameCount;

      for (
        let sceneFrameIndex = 0;
        sceneFrameIndex <= sceneFrameCount;
        sceneFrameIndex++
      ) {
        const sceneFrameTimeMS = (sceneFrameIndex / fps) * 1000;
        const globalFrameTimeMS = (frameIndex / fps) * 1000;

        if (this.started) {
          this.ticker.time = sceneFrameTimeMS / 1000; // 拓展字段，记录当前tick的时间, 单位秒
          this.ticker.update(sceneFrameTimeMS); // 手动触发ticker更新
          this.ticker.globalTime = globalFrameTimeMS / 1000; // 拓展字段，记录全局时间

          // 等待所有异步任务完成
          await Promise.all(this.ticker.asyncHandlers);

          if (this.connecter?.connection) {
            await this.connecter.handle({
              timestamp: globalFrameTimeMS, // 仅针对预览/合成时，需要给出全局时间
              imageSource: this.ticker.ctx.imageSource!,
              audioBuffers: this.ticker.ctx.audioBuffers!,
            });
          }

          if (this.rendererOptions.onProgress) {
            this.rendererOptions.onProgress(
              (sceneIndex / sceneScripts.length +
                sceneFrameIndex / sceneFrameCount / sceneScripts.length) *
                100,
              globalFrameTimeMS / 1000,
            );
          }
        } else {
          break;
        }

        frameIndex++;
      }

      // 当前场景执行完成，卸载相关的监听器
      uninstall();
    }

    let result;

    if (this.started && this.connecter?.connection) {
      result = await this.connecter.finish();
    }

    this.started = false;

    return {
      result,
      subtitles: this.subtitles,
    };
  }
}
