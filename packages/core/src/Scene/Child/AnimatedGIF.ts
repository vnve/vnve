/**
 * modified from https://github.com/pixijs/gif/blob/v2.x/src/AnimatedGIF.ts
 */
import { Sprite, Texture, Renderer, SCALE_MODES } from "pixi.js";
import { parseGIF, decompressFrames, ParsedFrame } from "gifuct-js"; // TODO: replace with ImageDecoder
import { getTransformArray, reviveFilters, uuid } from "../../Utils";
import { cloneDeep } from "lodash-es";
import { Child } from "./Child";
import { applyMixins } from "./Mixin";
import { Filter } from "../..";

/** Represents a single frame of a GIF. Includes image and timing data. */
interface FrameObject {
  /** Image data for the current frame */
  imageData: ImageData;
  /** The start of the current frame, in milliseconds */
  start: number;
  /** The end of the current frame, in milliseconds */
  end: number;
}

/** Default options for all AnimatedGIF objects. */
interface AnimatedGIFOptions {
  /**
   * Name of the GIF
   */
  name?: string;
  /**
   * Source of the GIF image
   */
  source: string;
  /** Width of the GIF image */
  width?: number;
  /** Height of the GIF image */
  height?: number;
  /**
   * Scale Mode to use for the texture
   * @type {PIXI.SCALE_MODES}
   */
  scaleMode?: SCALE_MODES;
  /** To enable looping */
  loop?: boolean;
  /** Speed of the animation */
  animationSpeed?: number;
  /** Fallback FPS if GIF contains no time information */
  fps?: number;
}

/**
 * Runtime object to play animated GIFs. This object is similar to an AnimatedSprite.
 * It support playback (seek, play, stop) as well as animation speed and looping.
 * @see Thanks to {@link https://github.com/matt-way/gifuct-js/ gifuct-js}
 */
export class AnimatedGIF extends Sprite {
  public uuid = uuid();
  public type = "AnimatedGIF";

  public source?: string;
  public options: Required<AnimatedGIFOptions>;

  /**
   * The speed that the animation will play at. Higher is faster, lower is slower.
   * @default 1
   */
  public animationSpeed = 1;

  /**
   * Whether or not the animate sprite repeats after playing.
   * @default true
   */
  public loop = true;

  /** The total duration of animation in milliseconds. */
  public duration: number = 0;

  /** Collection of frame to render. */
  private _frames!: FrameObject[];

  /** Drawing context reference. */
  private _context!: CanvasRenderingContext2D;

  /** Dirty means the image needs to be redrawn. Set to `true` to force redraw. */
  public dirty = true;

  /** The current frame number (zero-based index). */
  private _currentFrame = -1;

  /** If animation is currently playing. */
  private _playing = false;

  /** Current playback position in milliseconds. */
  private _currentTime = 0;

  /**
   * @param frames - Data of the GIF image.
   * @param options - Options for the AnimatedGIF
   */
  constructor(options: AnimatedGIFOptions) {
    super(Texture.EMPTY);

    this.options = {
      name: "",
      scaleMode: SCALE_MODES.LINEAR,
      fps: 30,
      loop: true,
      animationSpeed: 1,
      width: 0,
      height: 0,
      ...options,
    };
    this.name = this.options.name;
    this.source = this.options.source;
    this.animationSpeed = this.options.animationSpeed;
    this.loop = this.options.loop;
  }

  public async load() {
    if (!this.source) {
      return;
    }

    const buffer = await (await fetch(this.source)).arrayBuffer();

    if (!buffer || buffer.byteLength === 0) {
      throw new Error("Invalid buffer");
    }

    // fix https://github.com/matt-way/gifuct-js/issues/30
    const validateAndFix = (gif: any): void => {
      let currentGce = null;

      for (const frame of gif.frames) {
        currentGce = frame.gce ?? currentGce;

        // fix loosing graphic control extension for same frames
        if ("image" in frame && !("gce" in frame)) {
          frame.gce = currentGce;
        }
      }
    };

    const gif = parseGIF(buffer);

    validateAndFix(gif);
    const gifFrames = decompressFrames(gif, true);
    const frames: FrameObject[] = [];

    // Temporary canvases required for compositing frames
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d", {
      willReadFrequently: true,
    }) as CanvasRenderingContext2D;
    const patchCanvas = document.createElement("canvas");
    const patchContext = patchCanvas.getContext(
      "2d",
    ) as CanvasRenderingContext2D;

    canvas.width = gif.lsd.width;
    canvas.height = gif.lsd.height;

    let time = 0;
    let previousFrame: ImageData | null = null;

    // Some GIFs have a non-zero frame delay, so we need to calculate the fallback
    const { fps, scaleMode, width: gifWidth, height: gifHeight } = this.options;
    const defaultDelay = 1000 / (fps as number);

    // Precompute each frame and store as ImageData
    for (let i = 0; i < gifFrames.length; i++) {
      // Some GIF's omit the disposalType, so let's assume clear if missing
      const {
        disposalType = 2,
        delay = defaultDelay,
        patch,
        dims: { width, height, left, top },
      } = gifFrames[i] as ParsedFrame;

      patchCanvas.width = width;
      patchCanvas.height = height;
      patchContext.clearRect(0, 0, width, height);
      const patchData = patchContext.createImageData(width, height);

      patchData.data.set(patch);
      patchContext.putImageData(patchData, 0, 0);

      if (disposalType === 3) {
        previousFrame = context.getImageData(0, 0, canvas.width, canvas.height);
      }

      context.drawImage(patchCanvas, left, top);
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

      if (disposalType === 2) {
        context.clearRect(0, 0, canvas.width, canvas.height);
      } else if (disposalType === 3) {
        context.putImageData(previousFrame as ImageData, 0, 0);
      }

      frames.push({
        start: time,
        end: time + delay,
        imageData,
      });
      time += delay;
    }

    // clear the canvases
    canvas.width = canvas.height = 0;
    patchCanvas.width = patchCanvas.height = 0;
    const { width, height } = gif.lsd;

    // init sprite
    this.duration = (frames[frames.length - 1] as FrameObject).end;
    this._frames = frames;

    // Create the texture
    const textureCanvas = document.createElement("canvas");
    const textureContext = textureCanvas.getContext(
      "2d",
    ) as CanvasRenderingContext2D;

    textureCanvas.width = gifWidth || width;
    textureCanvas.height = gifHeight || height;

    this.texture = Texture.from(textureCanvas, { scaleMode });

    this._context = textureContext;
    this._playing = false;
    this._currentTime = 0;

    // Draw the first frame
    this.dirty = true;
    this.currentFrame = 0;
  }

  /** Stops the animation. */
  public stop(): void {
    if (!this._playing) {
      return;
    }

    this._playing = false;
  }

  /** Plays the animation. */
  public play(): void {
    if (this._playing) {
      return;
    }

    this._playing = true;

    // If were on the last frame and stopped, play should resume from beginning
    if (!this.loop && this.currentFrame === this._frames.length - 1) {
      this._currentTime = 0;
    }
  }

  /**
   * Get the current progress of the animation from 0 to 1.
   * @readonly
   */
  public get progress(): number {
    return this._currentTime / this.duration;
  }

  /** `true` if the current animation is playing */
  public get playing(): boolean {
    return this._playing;
  }

  update(currentTime: number): void {
    const localTime = (currentTime * this.animationSpeed) % this.duration;
    const localFrame = this._frames.findIndex(
      (frame) => frame.start <= localTime && frame.end > localTime,
    );

    if (currentTime >= this.duration) {
      if (this.loop) {
        this._currentTime = localTime;
        this.updateFrameIndex(localFrame);
      } else {
        this._currentTime = this.duration;
        this.updateFrameIndex(this._frames.length - 1);
        this.stop();
      }
    } else {
      this._currentTime = localTime;
      this.updateFrameIndex(localFrame);
    }
  }

  /**
   * Redraw the current frame, is necessary for the animation to work when
   */
  private updateFrame(): void {
    if (!this.dirty || this._currentFrame < 0) {
      return;
    }

    // Update the current frame
    const { imageData } = this._frames[this._currentFrame] as FrameObject;

    this._context.putImageData(imageData, 0, 0);

    // Workaround hack for Safari & iOS
    // which fails to upload canvas after putImageData
    // See: https://bugs.webkit.org/show_bug.cgi?id=229986
    this._context.fillStyle = "transparent";
    this._context.fillRect(0, 0, 0, 1);

    this.texture.update();

    // Mark as clean
    this.dirty = false;
  }

  /**
   * Renders the object using the WebGL renderer
   *
   * @param {PIXI.Renderer} renderer - The renderer
   * @private
   */
  _render(renderer: Renderer): void {
    this.updateFrame();

    super._render(renderer);
  }

  /**
   * Renders the object using the WebGL renderer
   *
   * @param {PIXI.CanvasRenderer} renderer - The renderer
   * @private
   */
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  _renderCanvas(renderer: any): void {
    this.updateFrame();

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    super._renderCanvas(renderer);
  }

  /** Set the current frame number */
  get currentFrame(): number {
    return this._currentFrame;
  }
  set currentFrame(value: number) {
    this.updateFrameIndex(value);
    this._currentTime = (this._frames[value] as FrameObject).start;
  }

  /** Internally handle updating the frame index */
  private updateFrameIndex(value: number): void {
    if (value < 0 || value >= this._frames.length) {
      throw new Error(
        `Frame index out of range, expecting 0 to ${this.totalFrames}, got ${value}`,
      );
    }
    if (this._currentFrame !== value) {
      this._currentFrame = value;
      this.dirty = true;
    }
  }

  /**
   * Get the total number of frame in the GIF.
   */
  get totalFrames(): number {
    return this._frames.length;
  }

  /** Destroy and don't use after this. */
  destroy(): void {
    this.stop();
    super.destroy(true);

    const forceClear = null as any;

    this._context = forceClear;
    this._frames = forceClear;
  }

  cloneSelf(): AnimatedGIF {
    const cloned = new AnimatedGIF(cloneDeep(this.options));

    cloned.name = this.name;
    cloned.uuid = this.uuid;
    cloned.source = this.source;
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
      __type: "AnimatedGIF",
      uuid: this.uuid,
      name: this.name,
      source: AnimatedGIF.setSourceToDB(this.source),
      alpha: this.alpha,
      width: this.width,
      height: this.height,
      transform: getTransformArray(this),
      animationParams: this.animationParams,
      filters: this.filters,
    };
  }

  static async fromJSON(raw: any) {
    const gif = new AnimatedGIF({ source: raw.source });

    gif.uuid = raw.uuid;
    gif.name = raw.name;
    if (raw.source) {
      gif.source = await AnimatedGIF.getSourceFromDB(raw.source);
    }
    gif.alpha = raw.alpha;
    gif.setTransform(...raw.transform);
    gif.width = raw.width;
    gif.height = raw.height;
    gif.animationParams = raw.animationParams;
    gif.filters = reviveFilters(raw.filters);

    return gif;
  }

  static setSourceToDB(source?: any) {
    return source;
  }

  static async getSourceFromDB(source: string) {
    return source;
  }

  async tick(timestamp: number) {
    this.update(timestamp);
  }
}

export interface AnimatedGIF extends Sprite, Child {}
applyMixins(AnimatedGIF, [Child]);
