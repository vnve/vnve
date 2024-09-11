import { create } from "zustand";
import { Child, Editor, Scene } from "@vnve/next-core";
import { immer } from "zustand/middleware/immer";
import { immerable } from "immer";

Editor[immerable] = true;
Scene[immerable] = true;

export const useEditorStore = create<{
  editor: Editor;
  activeChild: Child | null;
  activeScene: Scene | null;
  scenes: Scene[];
  initEditor(view: HTMLCanvasElement): void;
  updateActiveChild(fn: (child: Child) => void): void;
  updateActiveScene(fn: (scene: Scene) => void): void;
}>()(
  immer<any>((set) => {
    console.log("create once");
    let editor: Editor;

    // editor中所有需要在视图中展示的属性需要同步维护在store中
    // editor中，activeChild和activeScene内部属性的更新，必须通过update方法来更新，直接修改editor中的属性无法完成视图状态更新
    return {
      editor: null, // editor仅提供方法调用，内部属性不用作状态同步
      activeChild: null,
      activeScene: null,
      scenes: [],
      initEditor(view: HTMLCanvasElement) {
        console.log("initEditor");
        editor = new Editor({
          view,
          onChangeActiveChild(child) {
            set((state) => {
              state.activeChild = child;
            });
          },
          onChangeActiveScene(scene) {
            set((state) => {
              state.editor.activeScene = scene;
            });
          },
          onChangeScenes(scenes) {
            set((state) => {
              // 此时传入的scenes和editor.scenes是同一个引用，所以不需要没法更新
              // 1. 除非强制覆盖？
              // 2. 或者把editor内部的更新方式都改了
              state.editor.scenes = scenes;
            });
          },
        });

        set((state) => {
          state.editor = editor;
        });
      },
      updateActiveChild(fn: (child: Child) => void) {
        set((state) => {
          if (state.activeChild) {
            fn(state.activeChild);
          }
        });

        fn(editor.activeChild);
      },
      updateActiveScene(fn: (scene: Scene) => void) {
        set((state) => {
          if (state.editor.activeScene) {
            fn(state.editor.activeScene);
          }
        });

        fn(editor.activeScene);
      },
    };
  }),
);
