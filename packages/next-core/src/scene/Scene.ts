import * as PIXI from "pixi.js";
import { uuid } from "../util";
import { reviveSounds, Sound } from "./Sound";
import { Child, reviveChildren } from "./child";
import { Filter, reviveFilters } from "./filter";
import { reviveTransition, Transition } from "./transition";

export interface SceneOption {
  label?: string;
}

export class Scene extends PIXI.Container {
  public name: string;
  public label: string;
  public sounds: Sound[];
  public transitions: Transition[];
  public children: Child[];

  constructor(options?: SceneOption) {
    super();
    this.name = uuid();
    this.label = options?.label || "";
    this.sounds = [];
    this.transitions = [];
    this.children = [];
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

  public addTransition(transition: Transition) {
    this.transitions.push(transition);
  }

  public removeTransition(transition: Transition) {
    this.transitions = this.transitions.filter((t) => t !== transition);
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

  public clone(): Scene {
    // clone出来scene的name不一样，但子元素的name都是一样的
    const cloned = new Scene();

    cloned.label = this.label;

    const children = this.children.map((item) => item.clone(true));
    if (children.length > 0) {
      cloned.addChild(...children);
    }

    cloned.sounds = this.sounds.map((item) => item.clone(true));
    cloned.transitions = this.transitions.map((item) => item.clone(true));
    cloned.filters =
      this.filters?.map((item) => (item as Filter).clone(true)) || null;

    return cloned;
  }

  public toJSON() {
    return {
      __type: "Scene",
      name: this.name,
      label: this.label,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      children: this.children.filter((item: any) => !item.wireframe),
      sounds: this.sounds,
      transitions: this.transitions,
      filters: this.filters,
    };
  }

  static async fromJSON(json: AnyJSON) {
    const scene = new Scene();

    scene.name = json.name;
    scene.label = json.label;

    // revive children
    const children = await reviveChildren(json.children);
    if (children.length > 0) {
      scene.addChild(...children);
    }

    // revive sounds
    scene.sounds = await reviveSounds(json.sounds);

    // revive transitions
    scene.transitions = await reviveTransition(json.transitions);

    // revive filters
    scene.filters = await reviveFilters(json.filters);

    return scene;
  }

  public async load() {
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

    for (const sound of this.sounds) {
      await sound.load();
    }
  }
}
