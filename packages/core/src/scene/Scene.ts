import * as PIXI from "pixi.js";
import { uuid } from "../util";
import { reviveSounds, Sound } from "./Sound";
import { Child, reviveChildren, Sprite } from "./child";
import { Filter, reviveFilters } from "./filter";
import { cloneDeep } from "lodash-es";
import { SceneConfig, SpeakDirectiveOptions } from "../director";

export interface SceneOption {
  label?: string;
}

export interface Dialogue {
  speak: Omit<SpeakDirectiveOptions, "lines" | "targetName">;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  lines: any[]; // 同plate.js的value
}

export class Scene extends PIXI.Container {
  public name: string;
  public label: string;
  public config: SceneConfig;
  public dialogues: Dialogue[];
  public sounds: Sound[];
  public declare children: Child[];

  constructor(options?: SceneOption) {
    super();
    this.name = uuid();
    this.label = options?.label || "";

    this.config = {
      speak: {
        targetName: "",
        wordsPerMin: 500,
        interval: 0.2,
        effect: "typewriter",
        speaker: {
          targetName: "",
          name: "",
          autoShowSpeaker: {
            inEffect: "Show",
          },
          autoMaskOtherSpeakers: {
            alpha: 0.5,
          },
        },
      },
      autoShowBackground: true,
    };
    this.dialogues = [];
    this.sounds = [];
    this.sortableChildren = true;
  }

  public getSoundByName(name: string) {
    return this.sounds.find((item) => item.name === name);
  }

  public addSound(sound: Sound) {
    this.sounds.push(sound);
  }

  public removeSound(sound: Sound) {
    this.sounds = this.sounds.filter((item) => {
      if (item.name === sound.name) {
        sound.destroy();
        return false;
      }

      return true;
    });
  }

  public addFilter(filter: Filter) {
    if (this.filters) {
      this.filters.push(filter);
    } else {
      this.filters = [filter];
    }
  }

  public removeFilter(filter: Filter) {
    if (this.filters) {
      this.filters = this.filters.filter((f) => f !== filter);
    }
  }

  public addDialogue(dialogue: Dialogue, index?: number) {
    if (typeof index !== "undefined") {
      this.dialogues.splice(index, 0, dialogue);
    } else {
      this.dialogues.push(dialogue);
    }
  }

  public updateDialogue(index: number, dialogue: Dialogue) {
    this.dialogues[index] = dialogue;
  }

  public removeDialogue(dialogue: Dialogue) {
    this.dialogues = this.dialogues.filter((item) => item !== dialogue);
  }

  public swapDialogue(a: number, b: number) {
    [this.dialogues[a], this.dialogues[b]] = [
      this.dialogues[b],
      this.dialogues[a],
    ];
  }

  public getChildByLabel(label: string) {
    return this.children.find((item) => item.label === label);
  }

  public getChildrenByAssetType(assetType: string) {
    return this.children.filter(
      (item) => (item as Sprite).assetType === assetType,
    );
  }

  public clone(): Scene {
    // clone出来scene的name不一样，但子元素的name都是一样的
    const cloned = new Scene();

    cloned.label = this.label;
    cloned.config = cloneDeep(this.config);
    cloned.dialogues = cloneDeep(this.dialogues);

    const children = this.children.map((item) => item.clone(true));
    if (children.length > 0) {
      cloned.addChild(...children);
    }

    cloned.sounds = this.sounds.map((item) => item.clone(true));
    cloned.filters =
      this.filters?.map((item) => (item as Filter).clone(true)) || null;

    return cloned;
  }

  public toJSON() {
    return {
      __type: "Scene",
      name: this.name,
      label: this.label,
      config: this.config,
      dialogues: this.dialogues,
      children: this.children,
      sounds: this.sounds,
      filters: this.filters,
    };
  }

  static async fromJSON(json: AnyJSON, exact = true) {
    const scene = new Scene();

    if (exact) {
      scene.name = json.name;
    }
    scene.label = json.label;
    scene.config = json.config;
    scene.dialogues = json.dialogues;

    // revive children
    const children = await reviveChildren(json.children);
    if (children.length > 0) {
      scene.addChild(...children);
    }

    // revive sounds
    scene.sounds = await reviveSounds(json.sounds);

    // revive filters
    scene.filters = await reviveFilters(json.filters);

    return scene;
  }

  public async load({ skipSoundLoading = false } = {}) {
    const traverseChild = async (child: Child) => {
      if (typeof child.load === "function") {
        await child.load();
      }

      if (child.children && child.children.length > 0) {
        for (const grandchild of child.children) {
          await traverseChild(grandchild as Child);
        }
      }
    };

    // trigger children load resource
    for (const child of this.children) {
      await traverseChild(child);
    }

    if (!skipSoundLoading) {
      for (const sound of this.sounds) {
        await sound.load();
      }
    }
  }
}
