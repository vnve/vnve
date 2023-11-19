import { v4 as uuid } from "uuid";
import { ICreatorTickCtx } from "../../Creator";
import { fetchUrlToAudiBuffer } from "../../Utils";

export interface ISoundOption {
  name?: string;
  source: string;
  start?: number;
  duration?: number;
  loop?: boolean;
  volume?: number;
}

export class Sound {
  public name: string;
  public source: string;
  public start: number;
  public duration: number;
  public loop: boolean;
  public volume: number;
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
    this.uuid = uuid();
  }

  public async load() {
    this.buffer = await fetchUrlToAudiBuffer(this.source);

    if (this.duration === 0) {
      this.duration = this.buffer.duration * 1000;
      this.bufferDuration = this.duration;
    }
  }

  public cloneSelf() {
    // TODO: return new Sound()
  }

  async tick(rawTimestamp: number, tickCtx: ICreatorTickCtx) {
    let timestamp = rawTimestamp;

    if (this.loop && timestamp > this.start + this.duration) {
      timestamp = timestamp % (this.start + this.duration);
    }

    if (
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

        if (hitNode) {
          if (hitNode.context.state !== "running") {
            hitNode.start();
          }
        } else {
          const newNode = tickCtx.previewerAudioContext.createBufferSource();

          newNode.buffer = this.buffer;
          newNode.connect(tickCtx.previewerAudioContext.destination);
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
