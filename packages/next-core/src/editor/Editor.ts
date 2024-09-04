import * as PIXI from "pixi.js";
import { Transformer } from "@pixi-essentials/transformer";
import { Scene, Child, Dialogue } from "../scene";
import { log } from "../util";
import { DirectiveConfig, SceneScript, Screenplay } from "../director";

export type EditorChildPosition =
  | "top"
  | "middle"
  | "bottom"
  | "left"
  | "center"
  | "right";

interface EditorOption {
  view: PIXI.ICanvas;
  width: number;
  height: number;
  background: number;
  onChangeActiveChild: (child?: Child) => void;
  onChangeActiveScene: (scene: Scene) => void;
}

export class Editor {
  private static defaultEditorOptions: Omit<EditorOption, "view"> = {
    width: 1920,
    height: 1080,
    background: 0x000000,
    onChangeActiveChild: () => {},
    onChangeActiveScene: () => {},
  };
  public options: Required<EditorOption>;
  public app: PIXI.Application;
  public scenes: Scene[];
  public activeScene?: Scene;
  public activeChild?: Child;
  public activeTransformer?: Transformer & {
    __isTapped?: boolean;
    __doubleTapTimer?: number;
  };

  constructor(options: Partial<EditorOption> & { view: PIXI.ICanvas }) {
    this.options = Object.assign({}, Editor.defaultEditorOptions, options);
    const { view, width, height, background } = this.options;
    this.app = new PIXI.Application({
      view,
      width,
      height,
      background,
    });
    this.scenes = [];
  }

  public addTransformer() {
    // TODO: perf transformer
    this.activeTransformer = new Transformer({
      wireframeStyle: {
        thickness: 4,
        color: 0x33cccc,
      },
    }).on("pointertap", () => {
      if (this.activeTransformer) {
        // hack code for double click to unselect active child
        if (this.activeTransformer.__isTapped) {
          this.activeChild = undefined;
          this.activeTransformer.group = [];
          this.options.onChangeActiveChild(undefined);
          if (this.activeTransformer.__doubleTapTimer) {
            clearTimeout(this.activeTransformer.__doubleTapTimer);
          }
          this.activeTransformer.__isTapped = false;
        } else {
          this.activeTransformer.__isTapped = true;
          this.activeTransformer.__doubleTapTimer = setTimeout(() => {
            if (this.activeTransformer) {
              this.activeTransformer.__isTapped = false;
            }
          }, 600);
        }
      }
    });
    this.activeScene?.addChild(this.activeTransformer);
  }

  public removeTransformer() {
    if (this.activeTransformer) {
      this.activeScene?.removeChild(this.activeTransformer);
      this.activeTransformer.destroy();
      this.activeTransformer = undefined;
    }
  }

  public addChildTransformListener(child: Child) {
    child.interactive = true;
    child.on("pointerdown", () => {
      this.setActiveChild(child);
    });
  }

  public setActiveChild(child: Child) {
    this.activeChild = child;
    if (!this.activeTransformer) {
      this.addTransformer();
    }
    if (this.activeTransformer) {
      this.activeTransformer.group = [child];
      // move transformer to top for it can be interactive move
      this.moveChildToTop(this.activeTransformer as unknown as Child);
    }

    this.options.onChangeActiveChild(child);
  }

  public removeChildTransformListener(child: Child) {
    child.removeAllListeners("click");
  }

  public addScene(scene: Scene, sceneIndex?: number) {
    if (typeof sceneIndex === "undefined") {
      this.scenes.push(scene);
    } else {
      this.scenes.splice(sceneIndex, 0, scene);
    }
    const traverseChild = (child: Child) => {
      if (child.children && child.children.length > 0) {
        for (const grandchild of child.children) {
          traverseChild(grandchild as Child);
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

  public loadScenes(scenes: Scene[]) {
    scenes.forEach((scene) => {
      this.addScene(scene);
    });
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
    this.activeScene.load();
    this.addTransformer();
    this.stageAddChild(scene);
    this.options.onChangeActiveScene(scene);
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
      child.destroy();
    }
  }

  public cloneChild(targetChild?: Child) {
    const child = targetChild ?? this.activeChild;

    if (child) {
      return child.clone();
    }
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

  private genSceneScript(scene: Scene): SceneScript {
    const dialogues = scene.dialogues;
    const directives: DirectiveConfig[] = [];

    for (const dialogue of dialogues) {
      const { speaker, lines } = dialogue;

      lines.forEach((line) => {
        // TODO: line => directives
      });
    }

    return;
  }

  public exportScreenplay(): Screenplay {
    const scenes = this.exportScenes();
    const sceneScripts = scenes.map(this.genSceneScript);

    return {
      config: {}, // TODO: 全局配置
      scenes: sceneScripts,
    };
  }

  public exportScenes() {
    this.removeTransformer();

    const now = performance.now();
    const scenes = this.scenes.map((item) => item.clone());

    log.info("editor export cost:", performance.now() - now);

    return scenes;
  }

  public saveAsJSON() {
    this.removeTransformer();

    return JSON.stringify({
      version: "2.0",
      config: {},
      scenes: this.scenes,
    });
  }

  public async loadFromJSON(editorJSON: string) {
    const editor = JSON.parse(editorJSON);
    const scenes = [];

    for (const sceneJSON of editor.scenes) {
      const scene = await Scene.fromJSON(sceneJSON);

      scenes.push(scene);
    }

    this.loadScenes(scenes);
  }

  public stageAddChild(scene: Scene) {
    this.app.stage.addChild(scene);
  }

  public stageRemoveChild(scene: Scene) {
    const targetScene = this.app.stage.children.find(
      (child) => child.name === scene.name,
    );

    if (targetScene) {
      this.app.stage.removeChild(targetScene);
    }
  }

  public setChildPosition(pos: EditorChildPosition, child?: Child) {
    const targetChild = child ?? this.activeChild;
    const { width: stageWidth, height: stageHeight } = this.options;

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
