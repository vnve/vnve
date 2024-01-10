import * as PIXI from "pixi.js";
import { gsap } from "gsap";
import { v4 as uuid } from "uuid";
import { Child } from "./Type";
import { Sound } from "./Sound";
import { ICreatorTickCtx } from "../Creator";
import { cloneDeep } from "lodash-es";
import { Transition } from "./Transition";
import { Filter } from "./Filter";

interface ISceneOption {
  name?: string;
  start?: number;
  duration: number;
}

export class Scene extends PIXI.Container {
  public uuid: string;
  public name: string;
  public options: ISceneOption;
  public start: number;
  public duration: number;
  public sounds: Sound[];
  public transitions: Transition[];
  public type: string;

  private animationLine?: gsap.core.Timeline;

  constructor(options: ISceneOption) {
    super();
    this.options = options;
    this.uuid = uuid();
    this.name = options.name || "";
    this.start = options.start || 0;
    this.duration = options.duration;
    this.sounds = [];
    this.transitions = [];
    this.type = "";
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    globalThis.__PIXI_STAGE__ = this;
  }

  public addSound(sound: Sound) {
    this.sounds.push(sound);
  }

  public removeSound(sound: Sound) {
    this.sounds = this.sounds.filter((s) => s !== sound);
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

  public setDuration(duration: number) {
    this.duration = duration;
  }

  public setChildToTop(child: Child) {
    this.setChildIndex(child, this.children.length - 1);
  }

  public setChildToBottom(child: Child) {
    this.setChildIndex(child, 0);
  }

  public setChildUp(child: Child) {
    const index = this.children.indexOf(child);

    if (index < this.children.length - 1) {
      this.swapChildren(child, this.children[index + 1] as Child);
    }
  }

  public setChildDown(child: Child) {
    const index = this.children.indexOf(child);

    if (index > 0) {
      this.swapChildren(child, this.children[index - 1] as Child);
    }
  }

  // clone from other scene
  public cloneFrom(scene: Scene) {
    this.name = scene.name;
    this.start = scene.start;
    this.duration = scene.duration;

    this.type = scene.type;
    // TODO: perf rm cloneDeep
    this.sounds = cloneDeep(scene.sounds);
    this.transitions = cloneDeep(scene.transitions);
    this.filters =
      scene.filters?.map((item) => (item as Filter).cloneSelf()) || null;

    scene.children
      .map((item) => {
        return (item as Child).cloneSelf();
      })
      .forEach((item) => {
        this.addChild(item);
      });
  }

  // clone self
  public clone(): Scene {
    const clonedScene = new Scene({
      name: this.name,
      start: this.start,
      duration: this.duration,
    });

    // TODO: perf rm cloneDeep
    clonedScene.type = this.type;
    clonedScene.sounds = cloneDeep(this.sounds);
    clonedScene.transitions = cloneDeep(this.transitions);
    clonedScene.filters =
      this.filters?.map((item) => (item as Filter).cloneSelf()) || null;

    this.children
      .map((item) => {
        return (item as Child).cloneSelf();
      })
      .forEach((item) => {
        clonedScene.addChild(item);
      });

    return clonedScene;
  }

  public async loadResource() {
    const traverseChild = async (child: any) => {
      if (typeof child.load === "function") {
        await child.load();
      }

      if (child.children && child.children.length > 0) {
        for (const grandchild of child.children) {
          await traverseChild(grandchild);
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

  public saveAsJSON() {
    // TODO:
  }

  public loadFromJSON() {
    // TODO:
  }

  public loadAnimation() {
    this.animationLine = gsap.timeline({ paused: true });

    const traverseChild = async (child: any) => {
      if (child.animationParams) {
        const childTimeLine = gsap.timeline();

        for (const animationParam of child.animationParams) {
          const [fromVars, toVars] = animationParam.value;

          childTimeLine.fromTo(
            child,
            {
              ...(fromVars || {}),
            },
            {
              ...(toVars || {}),
            },
            0,
          );
        }

        this.animationLine?.add(childTimeLine, 0);
      }

      if (child.children && child.children.length > 0) {
        for (const grandchild of child.children) {
          traverseChild(grandchild);
        }
      }
    };

    // trigger children tick update
    for (const child of this.children) {
      traverseChild(child);
    }
  }

  public seek(timestamp: number) {
    this.animationLine?.seek(timestamp);
  }

  public async tick(timestamp: number, tickCtx: ICreatorTickCtx) {
    // update view
    if (timestamp >= this.start && timestamp <= this.start + this.duration) {
      // stage change
      tickCtx.currentStage = this;

      const sceneTimestamp = timestamp - this.start;

      this.seek(sceneTimestamp);

      for (const sound of this.sounds) {
        await sound.tick(sceneTimestamp, tickCtx);
      }

      for (const transition of this.transitions) {
        await transition.tick(sceneTimestamp, tickCtx);
      }
    } else {
      // when scene finished stop all preview sounds
      // TODO: perf for preview sound play
      if (
        tickCtx.previewerAudioContext &&
        tickCtx.previewerAudioBufferSourceNodes
      ) {
        this.sounds.forEach((sound) => {
          const hitNode = tickCtx.previewerAudioBufferSourceNodes?.find(
            (item) => item.buffer === sound.buffer,
          );

          if (hitNode) {
            hitNode.stop();
          }
        });
      }
    }
  }
}
