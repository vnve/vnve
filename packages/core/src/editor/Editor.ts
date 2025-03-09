import * as PIXI from "pixi.js";
import { Transformer } from "@pixi-essentials/transformer";
import { Scene, Child, Dialogue, Sound, Sprite } from "../scene";
import { log } from "../util";
import {
  DirectiveConfig,
  DirectiveName,
  SceneScript,
  Screenplay,
} from "../director";
import { LayerZIndex } from "./constant";
import { cloneDeep } from "lodash-es";

export type EditorChildPosition =
  | "top"
  | "middle"
  | "bottom"
  | "left"
  | "near-left"
  | "center"
  | "near-right"
  | "right";

interface EditorOption {
  view: PIXI.ICanvas;
  width: number;
  height: number;
  background: number;
  onChangeActiveChild: (child?: Child) => void;
  onChangeActiveScene: (scene?: Scene) => void;
  onChangeScenes: (scenes: Scene[]) => void;
}

export class Editor {
  private static defaultEditorOptions: Omit<EditorOption, "view"> = {
    width: 1920,
    height: 1080,
    background: 0x000000,
    onChangeActiveChild: () => {},
    onChangeActiveScene: () => {},
    onChangeScenes: () => {},
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
        color: 0x00a1ff,
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

  public setActiveChild(child?: Child) {
    this.activeChild = child;

    if (child) {
      if (!this.activeTransformer) {
        this.addTransformer();
      }
      if (this.activeTransformer) {
        this.activeTransformer.group = [child];
        // move transformer to top for it can be interactive move
        this.moveChildToTop(this.activeTransformer as unknown as Child);
      }
    }

    this.options.onChangeActiveChild(child);
  }

  public setActiveChildByName(name: string) {
    const scene = this.activeScene;

    if (scene) {
      const child = scene.children.find((item) => item.name === name);

      if (child) {
        this.setActiveChild(child);
      }
    }
  }

  public updateActiveChild(fn: (child: Child) => void) {
    if (this.activeChild) {
      fn(this.activeChild);

      this.options.onChangeActiveChild(this.activeChild);
    }
  }

  public removeChildTransformListener(child: Child) {
    child.removeAllListeners("pointerdown");
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

    this.options.onChangeScenes(this.scenes);
  }

  public loadScenes(scenes: Scene[]) {
    scenes.forEach((scene) => {
      this.addScene(scene);
    });

    this.options.onChangeScenes(this.scenes);
  }

  public removeScene(scene: Scene) {
    this.scenes = this.scenes.filter((item) => item !== scene);
    if (this.activeScene === scene) {
      this.stageRemoveChild(this.activeScene);
      this.activeScene.destroy();
      this.activeScene = undefined;
    }

    this.options.onChangeScenes(this.scenes);
  }

  public removeSceneByIndex(index: number) {
    this.removeScene(this.scenes[index]);
  }

  public removeSceneByName(name: string) {
    const scene = this.getSceneByName(name);

    if (scene) {
      this.removeScene(scene);
    }
  }

  public getSceneByName(name: string) {
    return this.scenes.find((item) => item.name === name);
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

  public cloneSceneByName(name: string) {
    const scene = this.getSceneByName(name);

    if (scene) {
      return this.cloneScene(scene);
    }
  }

  public swapScene(a: number, b: number) {
    [this.scenes[a], this.scenes[b]] = [this.scenes[b], this.scenes[a]];

    this.options.onChangeScenes(this.scenes);
  }

  public setActiveScene(scene?: Scene) {
    if (this.activeScene) {
      this.stageRemoveChild(this.activeScene);
      this.removeTransformer();
    }
    this.activeScene = scene;

    if (scene) {
      this.activeScene!.load({ skipSoundLoading: true });
      this.addTransformer();
      this.stageAddChild(scene);
    }

    this.options.onChangeActiveScene(scene);
  }

  public setActiveSceneByName(name: string) {
    const scene = this.scenes.find((item) => item.name === name);

    if (scene) {
      this.setActiveScene(scene);
    }
  }

  public setActiveSceneByIndex(index: number) {
    this.setActiveScene(this.scenes[index]);
  }

  public getActiveSceneIndex() {
    return this.activeScene ? this.scenes.indexOf(this.activeScene) : -1;
  }

  public updateActiveScene(fn: (scene: Scene) => void) {
    if (this.activeScene) {
      fn(this.activeScene);

      this.options.onChangeActiveScene(this.activeScene);
    }
  }

  public addChild(child: Child) {
    const scene = this.activeScene;

    if (scene) {
      this.addChildTransformListener(child);
      scene.addChild(child);

      this.options.onChangeActiveScene(scene);
    }
  }

  public removeChild(child: Child) {
    const scene = this.activeScene;

    if (scene) {
      if (this.activeChild?.name === child.name) {
        this.setActiveChild(undefined);
        this.removeTransformer();
      }

      this.removeChildTransformListener(child);
      scene.removeChild(child);
      child.destroy();

      this.options.onChangeActiveScene(scene);
    }
  }

  public removeChildByName(name: string) {
    const scene = this.activeScene;

    if (scene) {
      const child = scene.children.find((item) => item.name === name);

      if (child) {
        this.removeChild(child);
      }
    }
  }

  public toggleChildVisibleByName(name: string) {
    const scene = this.activeScene;

    if (scene) {
      const child = scene.children.find((item) => item.name === name);

      if (child) {
        child.visible = !child.visible;
      }

      this.options.onChangeActiveScene(scene);
    }
  }

  public toggleChildInteractiveByName(name: string) {
    const scene = this.activeScene;

    if (scene) {
      const child = scene.children.find((item) => item.name === name);

      if (child) {
        child.interactive = !child.interactive;
      }

      this.options.onChangeActiveScene(scene);
    }
  }

  public cloneChild(targetChild?: Child) {
    const child = targetChild ?? this.activeChild;

    if (child) {
      return child.clone();
    }
  }

  public addSound(sound: Sound) {
    const scene = this.activeScene;

    if (scene) {
      scene.addSound(sound);
      this.options.onChangeActiveScene(scene);
    }
  }

  public removeSound(sound: Sound) {
    const scene = this.activeScene;

    if (scene) {
      scene.removeSound(sound);
      this.options.onChangeActiveScene(scene);
    }
  }

  public removeSoundByName(name: string) {
    const scene = this.activeScene;

    if (scene) {
      const sound = scene.sounds.find((item) => item.name === name);

      if (sound) {
        this.removeSound(sound);
      }
    }
  }

  public cloneDialogue(dialogue: Dialogue) {
    return cloneDeep(dialogue);
  }

  public cloneDialogueSpeak(speak: Dialogue["speak"]) {
    return cloneDeep(speak);
  }

  public addDialogue(dialogue: Dialogue, index?: number) {
    const scene = this.activeScene;

    if (scene) {
      scene.addDialogue(dialogue, index);
      this.options.onChangeActiveScene(scene);
    }
  }

  public updateDialogue(index: number, dialogue: Dialogue) {
    const scene = this.activeScene;

    if (scene) {
      scene.updateDialogue(index, dialogue);
      this.options.onChangeActiveScene(scene);
    }
  }

  public removeDialogue(dialogue: Dialogue) {
    const scene = this.activeScene;

    if (scene) {
      scene.removeDialogue(dialogue);
      this.options.onChangeActiveScene(scene);
    }
  }

  public swapDialogue(a: number, b: number) {
    const scene = this.activeScene;

    if (scene) {
      scene.swapDialogue(a, b);
      this.options.onChangeActiveScene(scene);
    }
  }

  public swapChildren(child1: Child, child2: Child) {
    this.activeScene?.swapChildren(child1, child2);
  }

  public moveChildTo(zIndex: LayerZIndex, child?: Child) {
    const targetChild = child ?? this.activeChild;

    if (targetChild) {
      targetChild.zIndex = zIndex;
    }
  }

  public moveChildToTop(child?: Child) {
    const targetChild = child ?? this.activeChild;

    if (this.activeScene && targetChild) {
      targetChild.zIndex = LayerZIndex.Text;
      this.activeScene.setChildIndex(
        targetChild,
        this.activeScene.children.length - 1,
      );
    }
  }

  public moveChildToBottom(child?: Child) {
    const targetChild = child ?? this.activeChild;

    if (this.activeScene && targetChild) {
      targetChild.zIndex = LayerZIndex.Background;
      this.activeScene?.setChildIndex(targetChild, 0);
    }
  }

  public moveUpChild(child?: Child) {
    const targetChild = child ?? this.activeChild;

    if (this.activeScene && targetChild) {
      const index = this.activeScene.children.indexOf(targetChild);

      if (index < this.activeScene.children.length - 1) {
        const higherChild = this.activeScene.children[index + 1];

        // 同步调整zIndex
        if (higherChild.zIndex > targetChild.zIndex) {
          targetChild.zIndex = higherChild.zIndex;
        }

        this.swapChildren(targetChild, higherChild);
      }
    }
  }

  public moveDownChild(child?: Child) {
    const targetChild = child ?? this.activeChild;

    if (this.activeScene && targetChild) {
      const index = this.activeScene.children.indexOf(targetChild);

      if (index > 0) {
        const lowerChild = this.activeScene.children[index - 1];

        if (lowerChild.zIndex < targetChild.zIndex) {
          targetChild.zIndex = lowerChild.zIndex;
        }

        this.swapChildren(targetChild, lowerChild);
      }
    }
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
      case "near-left":
        targetChild.x = stageWidth / 3 - targetChild.width / 2;
        break;
      case "center":
        targetChild.x = stageWidth / 2 - targetChild.width / 2;
        break;
      case "near-right":
        targetChild.x = (stageWidth / 3) * 2 - targetChild.width / 2;
        break;
      case "right":
        targetChild.x = stageWidth - targetChild.width;
        break;
      default:
        break;
    }
  }

  private genSceneScript(scene: Scene): SceneScript {
    const { dialogues, config } = scene;
    const sceneSpeakConfig = config.speak;
    const directives: DirectiveConfig[] = [];

    const sceneBackground = scene.children.find(
      (item) => (item as Sprite).assetType === "Background",
    );

    // 默认展示背景
    if (sceneBackground && config.autoShowBackground) {
      directives.push({
        directive: DirectiveName.Show,
        params: {
          targetName: sceneBackground.name,
        },
      });
    }

    for (const dialogue of dialogues) {
      const { speak: dialogueSpeakConfig, lines } = dialogue;

      if (sceneSpeakConfig?.dialogTargetName) {
        directives.push({
          directive: DirectiveName.Show,
          params: {
            targetName: sceneSpeakConfig.dialogTargetName,
          },
        });
      }

      directives.push({
        directive: DirectiveName.Speak,
        params: {
          lines,
          targetName: sceneSpeakConfig.targetName,
          wordsPerMin: dialogueSpeakConfig.wordsPerMin,
          interval: dialogueSpeakConfig.interval,
          effect: dialogueSpeakConfig.effect,
          effectDuration: dialogueSpeakConfig.effectDuration,
          speaker: sceneSpeakConfig.speaker.targetName
            ? {
                targetName: sceneSpeakConfig.speaker.targetName,
                name: dialogueSpeakConfig.speaker?.name || "",
                speakerTargetName:
                  dialogueSpeakConfig.speaker?.speakerTargetName,
                autoShowSpeaker: dialogueSpeakConfig.speaker?.autoShowSpeaker,
                autoMaskOtherSpeakers:
                  dialogueSpeakConfig.speaker?.autoMaskOtherSpeakers,
              }
            : undefined,
          voice: dialogueSpeakConfig.voice?.targetName
            ? dialogueSpeakConfig.voice
            : undefined,
        },
      });
    }

    return {
      scene,
      config,
      directives,
    };
  }

  public async exportScreenplay(start = 0, end?: number): Promise<Screenplay> {
    const scenes = this.exportScenes(start, end);
    const sceneScripts = scenes.map(this.genSceneScript);

    return {
      config: {}, // TODO: 作品全局配置
      scenes: sceneScripts,
    };
  }

  public exportScenes(start = 0, end?: number) {
    this.removeTransformer();

    const now = performance.now();
    const scenes = this.scenes.slice(start, end).map((item) => item.clone());

    log.info("editor export cost:", performance.now() - now);

    return scenes;
  }

  public saveAsJSON() {
    this.removeTransformer();

    return JSON.stringify({
      version: "2.0",
      config: {}, // TODO: 编辑器全局配置
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

  public clear() {
    this.scenes.forEach((scene) => {
      this.removeScene(scene);
    });
    this.setActiveScene(undefined);
    this.setActiveChild(undefined);
    this.removeTransformer();
  }
}
