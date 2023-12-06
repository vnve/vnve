/**
 * canvas => editor => scenes => creator
 */
import * as PIXI from "pixi.js";
import { Transformer } from "@pixi-essentials/transformer";
import { Scene, Filter, Child, Sound } from "./Scene";
import { DEFAULT_BACKGROUND, DEFAULT_HEIGHT, DEFAULT_WIDTH } from "./Const";

export type IEditorChildPosition =
  | "top"
  | "middle"
  | "bottom"
  | "left"
  | "center"
  | "right";

interface IEditorOption {
  container: HTMLCanvasElement;
  width?: number;
  height?: number;
  background?: string;
  onChangeActiveChild?: (child: Child) => void;
  onChangeActiveScene?: (scene: Scene) => void;
}

export class Editor {
  public container: HTMLCanvasElement;
  public width: number;
  public height: number;
  public background: string;
  public app: PIXI.Application;
  public scenes: Scene[];
  public activeScene?: Scene;
  public activeChild?: Child;
  public activeTransformer?: Transformer;
  public onChangeActiveChild?: (child: Child) => void;
  public onChangeActiveScene?: (scene: Scene) => void;

  constructor(options: IEditorOption) {
    this.container = options.container;
    this.width = options.width ?? DEFAULT_WIDTH;
    this.height = options.height ?? DEFAULT_HEIGHT;
    this.background = options.background ?? DEFAULT_BACKGROUND;
    this.onChangeActiveChild = options.onChangeActiveChild;
    this.onChangeActiveScene = options.onChangeActiveScene;
    this.app = new PIXI.Application({
      view: this.container,
      width: this.width,
      height: this.height,
      background: this.background,
    });
    this.scenes = [];
  }

  public addTransformer() {
    this.activeTransformer = new Transformer({
      wireframeStyle: {
        thickness: 4,
        color: 0x33cccc,
      },
    }).addListener("pointerupcapture", () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      if (this.activeTransformer && !this.activeTransformer._pointerDragging) {
        this.activeChild = undefined;
        this.activeTransformer.group = [];
      }
    });
    this.activeScene?.addChild(this.activeTransformer as any);
  }

  public removeTransformer() {
    if (this.activeTransformer) {
      this.activeScene?.removeChild(this.activeTransformer as any);
      this.activeTransformer.destroy();
      this.activeTransformer = undefined;
    }
  }

  public addChildTransformListener(child: Child) {
    child.interactive = true;
    child.eventMode = "static";
    child.on("pointerdown", () => {
      this.activeChild = child;
      if (!this.activeTransformer) {
        this.addTransformer();
      }
      if (this.activeTransformer) {
        this.activeTransformer.group = [child];
        // move transformer to top for it can be interactive move
        this.moveChildToTop(this.activeTransformer as any);
      }
      if (this.onChangeActiveChild) {
        this.onChangeActiveChild(child);
      }
    });
  }

  public removeChildTransformListener(child: Child) {
    if (child instanceof Sound || child instanceof Filter) {
      return;
    }
    child.removeAllListeners("click");
  }

  public addScene(scene: Scene) {
    this.scenes.push(scene);
    const traverseChild = (child: any) => {
      if (child.children && child.children.length > 0) {
        for (const grandchild of child.children) {
          traverseChild(grandchild);
        }
      } else {
        // only add on leaf node
        this.addChildTransformListener(child);
      }
    };

    // scene children add transformer event listener
    for (const child of scene.children) {
      traverseChild(child);
    }
  }

  public removeScene(scene: Scene) {
    this.scenes.splice(this.scenes.indexOf(scene), 1);
    if (this.activeScene === scene) {
      this.stageRemoveChild(this.activeScene);
      this.activeScene.destroy();
      this.activeScene = undefined;
    }
  }

  public removeSceneByIndex(index: number) {
    this.removeScene(this.scenes[index]);
  }

  public cloneScene(targetScene?: Scene) {
    this.removeTransformer();
    const scene = targetScene ?? this.activeScene;

    if (scene) {
      return scene.clone();
    }
  }

  public cloneSceneByIndex(index: number) {
    return this.cloneScene(this.scenes[index]);
  }

  public swapScene(a: number, b: number) {
    [this.scenes[a], this.scenes[b]] = [this.scenes[b], this.scenes[a]];
  }

  public renderScene(scene: Scene) {
    if (this.activeScene) {
      this.stageRemoveChild(this.activeScene);
      this.removeTransformer();
    }
    this.activeScene = scene;
    this.activeScene.loadResource();
    this.addTransformer();
    this.stageAddChild(scene);
    if (this.onChangeActiveScene) {
      this.onChangeActiveScene(scene);
    }
  }

  public renderSceneByIndex(index: number) {
    this.renderScene(this.scenes[index]);
  }

  public addChild(child: Child, targetScene?: Scene) {
    const scene = targetScene ?? this.activeScene;

    if (scene) {
      this.addChildTransformListener(child);
      scene.addChild(child);
    }
  }

  public removeChild(child: Child, targetScene?: Scene) {
    const scene = targetScene ?? this.activeScene;

    if (scene) {
      this.removeChildTransformListener(child);
      scene.removeChild(child);
    }
  }

  public cloneChild(targetChild?: Child) {
    const child = targetChild ?? this.activeChild;

    if (child) {
      const clonedChild = child.cloneSelf();

      return clonedChild as Child;
    }
  }

  public toggleChildInteractive(child: Child) {
    child.interactive = !child.interactive;
  }

  public swapChildren(child1: Child, child2: Child) {
    this.activeScene?.swapChildren(child1, child2);
  }

  public moveChildToTop(child?: Child) {
    const targetChild = child ?? this.activeChild;

    if (this.activeScene && targetChild) {
      this.activeScene.setChildIndex(
        targetChild,
        this.activeScene.children.length - 1,
      );
    }
  }

  public moveChildToBottom(child?: Child) {
    const targetChild = child ?? this.activeChild;

    if (this.activeScene && targetChild) {
      this.activeScene?.setChildIndex(targetChild, 0);
    }
  }

  public moveUpChild(child?: Child) {
    const targetChild = child ?? this.activeChild;

    if (this.activeScene && targetChild) {
      const index = this.activeScene.children.indexOf(targetChild);

      if (index < this.activeScene.children.length - 1) {
        this.swapChildren(
          targetChild,
          this.activeScene.children[index + 1] as Child,
        );
      }
    }
  }

  public moveDownChild(child?: Child) {
    const targetChild = child ?? this.activeChild;

    if (this.activeScene && targetChild) {
      const index = this.activeScene.children.indexOf(targetChild);

      if (index > 0) {
        this.swapChildren(
          targetChild,
          this.activeScene.children[index - 1] as Child,
        );
      }
    }
  }

  public exportScenes() {
    this.removeTransformer();
    console.time("export");
    // TODO: use raw scenes
    const scenes = this.scenes.map((item) => item.clone());
    console.timeEnd("export");

    return scenes;
  }

  public start() {
    this.app.start();
  }

  public stop() {
    this.app.stop();
  }

  public stageAddChild(scene: Scene) {
    this.app.stage.addChild(scene);
  }

  public stageRemoveChild(scene: Scene) {
    const targetScene = this.app.stage.children.find(
      (child) => (child as Scene).uuid === scene.uuid,
    ); // avoid when use vue proxy object !== raw object

    if (targetScene) {
      this.app.stage.removeChild(targetScene);
    }
  }

  public setChildPosition(pos: IEditorChildPosition, child?: Child) {
    const targetChild = child ?? this.activeChild;
    const stageHeight = this.height;
    const stageWidth = this.width;

    if (!targetChild) {
      return;
    }

    switch (pos) {
      case "top":
        targetChild.y = 0;
        break;
      case "middle":
        targetChild.y = stageHeight / 2 - targetChild.height / 2;
        break;
      case "bottom":
        targetChild.y = stageHeight - targetChild.height;
        break;
      case "left":
        targetChild.x = 0;
        break;
      case "center":
        targetChild.x = stageWidth / 2 - targetChild.width / 2;
        break;
      case "right":
        targetChild.x = stageWidth - targetChild.width;
        break;
      default:
        break;
    }
  }
}
