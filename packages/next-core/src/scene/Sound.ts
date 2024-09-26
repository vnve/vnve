import { SourceStore } from "../assets";
import { fetchAudioBuffer, reviveList, uuid } from "../util";

export interface ISoundOption {
  source: string;
}

export class Sound {
  public name: string;
  public label: string;
  public source: string;
  public assetID: number;
  public assetType: string;

  public buffer?: AudioBuffer;

  constructor(options: ISoundOption) {
    this.name = uuid();
    this.label = "";
    this.source = options.source;
    this.assetID = 0;
    this.assetType = "";
  }

  public changeSource(source: string) {
    SourceStore.destroy(this.source);
    this.source = source;
  }

  public async load() {
    this.buffer = await fetchAudioBuffer(this.source);
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
      source: SourceStore.getID(this.source),
      assetID: this.assetID,
      assetType: this.assetType,
    };
  }

  static async fromJSON(json: AnyJSON) {
    const source = await SourceStore.getURL(json.source);
    const sound = new Sound({ source });

    copyTo(json as Sound, sound, true);

    return sound;
  }

  public destroy() {
    SourceStore.destroy(this.source);
    this.buffer = undefined;
  }
}

function copyTo(from: Sound, to: Sound, exact = false) {
  if (exact) {
    to.name = from.name;
  }
  to.label = from.label;

  to.assetID = from.assetID;
  to.assetType = from.assetType;
}

export function reviveSounds(soundsJSON: AnyJSON): Promise<Sound[]> {
  return reviveList({ Sound }, soundsJSON);
}
