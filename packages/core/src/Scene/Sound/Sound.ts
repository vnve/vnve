import { ICreatorTickCtx } from "../../Creator";
import { fetchUrlToAudiBuffer, uuid } from "../../Utils";

export interface ISoundOption {
  name?: string;
  source: string;
  start?: number;
  duration?: number;
  loop?: boolean;
  volume?: number;
  untilEnd?: boolean;
}

export class Sound {
  public name: string;
  public source: string;
  public start: number;
  public duration: number;
  public loop: boolean;
  public volume: number;
  public untilEnd: boolean;
  public uuid: string;

  public buffer?: AudioBuffer;
  public bufferDuration?: number;

  constructor(options: ISoundOption) {
    this.name = options.name ?? "";
    this.source = options.source;
    this.start = options.start ?? 0;
    this.duration = options.duration ?? 0;
    this.loop = options.loop ?? false;
    this.volume = options.volume ?? 1;
    this.untilEnd = options.untilEnd ?? false;
    this.uuid = uuid();
  }

  public async load() {
    this.buffer = await fetchUrlToAudiBuffer(this.source);

    if (this.duration === 0) {
      this.duration = this.buffer.duration * 1000;
      this.bufferDuration = this.duration;
    }
  }

  public toJSON() {
    return {
      __type: "Sound",
      name: this.name,
      source: Sound.setSourceToDB(this.source),
      start: this.start,
      duration: this.duration,
      loop: this.loop,
      volume: this.volume,
      untilEnd: this.untilEnd,
      uuid: this.uuid,
    };
  }

  static async fromJSON(raw: any) {
    const sound = new Sound({
      source: (await Sound.getSourceFromDB(raw.source)) as string,
    });
    sound.name = raw.name;
    sound.start = raw.start;
    sound.duration = raw.duration;
    sound.loop = raw.loop;
    sound.volume = raw.volume;
    sound.untilEnd = raw.untilEnd;
    sound.uuid = raw.uuid;

    return sound;
  }

  static setSourceToDB(source?: any) {
    return source;
  }

  static async getSourceFromDB(source?: string) {
    return source;
  }

  public cloneSelf() {
    // TODO: return new Sound()
  }

  public destroy() {
    if (this.source?.startsWith("blob:")) {
      URL.revokeObjectURL(this.source);
    }
  }

  async tick(
    timestamp: number,
    tickCtx: ICreatorTickCtx,
    isCurrentScene: boolean,
  ) {
    if (this.loop && timestamp > this.start + this.duration) {
      timestamp = timestamp % (this.start + this.duration);
    }

    isCurrentScene = this.untilEnd ? true : isCurrentScene;

    if (
      isCurrentScene &&
      tickCtx.sliceAudioBuffer &&
      this.buffer &&
      timestamp >= this.start &&
      timestamp <= this.start + this.duration
    ) {
      const slicedAudioBuffers: AudioBuffer[] =
        tickCtx.slicedAudioBuffers ?? [];

      const slicedAudioBuffer = await tickCtx.sliceAudioBuffer(
        this.buffer,
        timestamp - this.start,
        this.volume,
      );

      slicedAudioBuffers.push(slicedAudioBuffer);
      tickCtx.slicedAudioBuffers = slicedAudioBuffers;

      // TODO: perf for preview sound play
      if (
        tickCtx.previewerAudioContext &&
        tickCtx.previewerAudioBufferSourceNodes
      ) {
        const hitNode = tickCtx.previewerAudioBufferSourceNodes.find(
          (item) => item.buffer === this.buffer,
        );

        if (!hitNode) {
          const newNode = tickCtx.previewerAudioContext.createBufferSource();

          newNode.buffer = this.buffer;
          newNode.connect(tickCtx.previewerAudioContext.destination);
          newNode.loop = this.loop;
          newNode.start();

          tickCtx.previewerAudioBufferSourceNodes.push(newNode);
        }
      }
    } else {
      // TODO: perf for preview sound play
      if (
        tickCtx.previewerAudioContext &&
        tickCtx.previewerAudioBufferSourceNodes
      ) {
        const hitNode = tickCtx.previewerAudioBufferSourceNodes.find(
          (item) => item.buffer === this.buffer,
        );

        if (hitNode) {
          hitNode.stop();
        }
      }
    }
  }
}
