import * as PIXI from "pixi.js";
import { Scene } from "../Scene";
import { FrameTicker } from "./FrameTicker";
import { Synthesizer, SynthesizerTickCtx } from "./Synthesizer";
import { Previewer } from "./Previewer";
import { sliceAudioBuffer, wait } from "../Utils";
import {
  DEFAULT_BACKGROUND,
  DEFAULT_FPS,
  DEFAULT_HEIGHT,
  DEFAULT_WIDTH,
} from "../Const";
import log from "loglevel";

interface ICreatorOptions {
  width?: number;
  height?: number;
  background?: string;
  fps?: number;
  onlyVideo?: boolean;
  onProgress?: (percent: number, timestamp: number, duration: number) => void;
}

export interface ICreatorTickCtx extends SynthesizerTickCtx {
  fps?: number;
  currentStage?: PIXI.Container; // for video render
  slicedAudioBuffers?: AudioBuffer[]; // for audio slice
  sliceAudioBuffer?: (
    audioBuffer: AudioBuffer,
    timestamp: number,
    volume?: number,
  ) => Promise<AudioBuffer>;
  // mixed ctx for previewer
  tickStartTime?: number;
  previewerAudioContext?: AudioContext;
  previewerAudioBufferSourceNodes?: AudioBufferSourceNode[];
}

export class Creator {
  public options: ICreatorOptions;
  public width: number;
  public height: number;
  public background: string;
  public fps: number;
  public onlyVideo: boolean;

  private scenes: Scene[];
  private renderer: PIXI.IRenderer;
  private ticker: FrameTicker<ICreatorTickCtx>;
  private synthesizer?: Synthesizer;
  private previewer?: Previewer;
  private onProgress?: (
    percent: number,
    timestamp: number,
    duration: number,
  ) => void;

  constructor(options: ICreatorOptions = {}) {
    this.options = options;
    this.width = this.options.width ?? DEFAULT_WIDTH;
    this.height = this.options.height ?? DEFAULT_HEIGHT;
    this.background = this.options.background ?? DEFAULT_BACKGROUND;
    this.fps = this.options.fps ?? DEFAULT_FPS;
    this.onlyVideo = this.options.onlyVideo ?? false;
    this.onProgress = this.options.onProgress;

    this.scenes = [];
    this.renderer = PIXI.autoDetectRenderer({
      view: new OffscreenCanvas(this.width, this.height), // TODO: perf
      width: this.width,
      height: this.height,
      background: this.background,
    });
    this.ticker = new FrameTicker<ICreatorTickCtx>({});
    this.addCreatorTickerInterceptor();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    globalThis.__PIXI_RENDERER__ = this.renderer;
  }

  private addCreatorTickerInterceptor() {
    this.ticker.interceptor.beforeAll(async () => {
      this.ticker.tickCtx = {
        fps: this.fps,
        sliceAudioBuffer: this.onlyVideo
          ? undefined
          : (audioBuffer: AudioBuffer, timestamp: number, volume?: number) =>
              sliceAudioBuffer(audioBuffer, timestamp, this.fps, volume),
      };
    });

    this.ticker.interceptor.after(async (_timestamp, tickCtx) => {
      await wait(1); // wait a moment for user to can do stop action TODO: use worker to perf
      // render updated view
      if (tickCtx.currentStage) {
        this.renderer.render(tickCtx.currentStage);
      }

      // update synthesizer needed resource
      tickCtx.imageSource = this.renderer.view as CanvasImageSource;
      tickCtx.audioBuffers = tickCtx.slicedAudioBuffers;

      // reset tick ctx
      tickCtx.currentStage = undefined;
      tickCtx.slicedAudioBuffers = [];
    });
  }

  public add(scene: Scene) {
    this.scenes.push(scene);
    this.ticker.add(scene.tick, scene);
  }

  public remove(scene: Scene) {
    this.scenes = this.scenes.filter((item) => item.uuid !== scene.uuid);
    this.ticker.remove(scene.tick);
    // TODO: rm transition
    scene.sounds.forEach((sound) => {
      if (typeof sound.destroy === "function") {
        sound.destroy();
      }
    });
    scene.destroy(true);
  }

  public reset() {
    this.scenes.forEach((scene) => {
      this.remove(scene);
    });
    this.scenes = [];
  }

  public load(scenes: Scene[]) {
    this.reset();
    scenes.forEach((scene) => {
      this.add(scene);
    });
  }

  public genDuration() {
    let duration = 0;

    this.scenes.forEach((scene, index) => {
      const prevScene = this.scenes[index - 1];

      if (index > 0) {
        scene.start = prevScene.start + prevScene.duration + 1; // TODO: +1
      }

      duration += scene.duration;
    });

    return {
      duration,
    };
  }

  public preloadResource(scene: Scene) {
    const preloadList: Array<Promise<void>> = [];
    const traverseChild = (child: any) => {
      if (typeof child.load === "function") {
        preloadList.push(child.load());
      }

      if (child.children && child.children.length > 0) {
        for (const grandchild of child.children) {
          traverseChild(grandchild);
        }
      }
    };

    for (const child of scene.children) {
      traverseChild(child);
    }

    for (const sound of scene.sounds) {
      preloadList.push(sound.load());
    }

    return Promise.all(preloadList);
  }

  public preloadAllResource() {
    const preloadScenes = [];

    for (const scene of this.scenes) {
      preloadScenes.push(this.preloadResource(scene));
    }

    return Promise.all(preloadScenes);
  }

  public loadSceneAnimation(scene: Scene) {
    scene.loadAnimation();
  }

  public loadAllSceneAnimation() {
    this.scenes.forEach((scene) => {
      this.loadSceneAnimation(scene);
    });
  }

  public async preview(container: HTMLCanvasElement, scenes?: Scene[]) {
    if (this.previewer?.active || this.synthesizer?.active) {
      log.warn("ticker is running");
      return;
    }

    if (scenes) {
      this.load(scenes);
    }

    this.loadAllSceneAnimation();
    await this.preloadAllResource();

    const { duration } = this.genDuration();

    if (this.previewer) {
      if (this.previewer.container !== container) {
        this.previewer.container = container;
      }
    } else {
      this.previewer = new Previewer({
        container,
        duration,
        fps: this.fps,
        ticker: this.ticker,
        onProgress: this.onProgress,
      });
    }

    await this.previewer.start(duration);
  }

  public stopPreview() {
    if (this.previewer) {
      this.previewer.stop();
    }
  }

  public async start(scenes?: Scene[]) {
    if (this.previewer?.active || this.synthesizer?.active) {
      log.warn("ticker is running");
      return;
    }

    if (scenes) {
      this.load(scenes);
    }

    this.loadAllSceneAnimation();
    await this.preloadAllResource();

    const { duration } = this.genDuration();

    if (!this.synthesizer) {
      this.synthesizer = new Synthesizer({
        width: this.width,
        height: this.height,
        duration,
        fps: this.fps,
        ticker: this.ticker,
        onlyVideo: this.onlyVideo,
        onProgress: this.onProgress,
      });
    }

    const videoBlob = await this.synthesizer.start(duration);

    return videoBlob;
  }

  public stop() {
    if (this.synthesizer) {
      this.synthesizer.stop();
      this.synthesizer = undefined;
    }
  }
}
