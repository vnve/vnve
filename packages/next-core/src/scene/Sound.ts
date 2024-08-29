import { SourceStore } from "../assets";
import { fetchAudioBuffer, reviveList, uuid } from "../util";

export interface ISoundOption {
  source: string;
  start?: number;
  duration?: number;
  loop?: boolean;
  volume?: number;
  untilEnd?: boolean;
}

export class Sound {
  public name: string;
  public label: string;
  public source: string;
  public start: number;
  public duration: number;
  public loop: boolean;
  public volume: number;
  public untilEnd: boolean;

  public buffer?: AudioBuffer;
  public bufferDuration?: number;

  constructor(options: ISoundOption) {
    this.name = uuid();
    this.label = "";
    this.source = options.source;
    this.start = options.start ?? 0;
    this.duration = options.duration ?? 0;
    this.loop = options.loop ?? false;
    this.volume = options.volume ?? 1;
    this.untilEnd = options.untilEnd ?? false;
  }

  public async load() {
    this.buffer = await fetchAudioBuffer(this.source);

    if (this.duration === 0) {
      this.duration = this.buffer.duration;
      this.bufferDuration = this.duration;
    }
  }

  public clone(exact = false) {
    const cloned = new Sound({ source: this.source });

    copyTo(this, cloned, exact);

    return cloned;
  }

  public toJSON() {
    const json = {};

    copyTo(this, json as Sound, true);

    return {
      __type: "Sound",
      ...json,
      source: SourceStore.get(this.source),
    };
  }

  static async fromJSON(json: AnyJSON) {
    const source = await SourceStore.set(json.source);
    const sound = new Sound({ source });

    copyTo(json as Sound, sound, true);

    return sound;
  }

  public destroy() {
    if (this.source?.startsWith("blob:")) {
      URL.revokeObjectURL(this.source);
    }

    this.buffer = undefined;
  }
}

function copyTo(from: Sound, to: Sound, exact = false) {
  if (exact) {
    to.name = from.name;
  }
  to.label = from.label;
  to.start = from.start;
  to.duration = from.duration;
  to.loop = from.loop;
  to.volume = from.volume;
  to.untilEnd = from.untilEnd;
}

export function reviveSounds(soundsJSON: AnyJSON): Promise<Sound[]> {
  return reviveList({ Sound }, soundsJSON);
}
