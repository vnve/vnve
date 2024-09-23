import { create } from "zustand";
import { Child, Editor, Scene } from "@vnve/next-core";
import { immer } from "zustand/middleware/immer";
import { immerable } from "immer";

// TODO: immerable ?
// Editor[immerable] = true;
// Scene[immerable] = true;
// Child[immerable] = true;

export const useEditorStore = create<{
  editor: Editor;
  activeChild: Child | null;
  activeScene: Scene | null;
  scenes: Scene[];
  initEditor(view: HTMLCanvasElement): void;
  updateActiveChild(fn: (child: Child) => void): void;
  updateActiveScene(fn: (scene: Scene) => void): void;
}>()(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  immer<any>((set) => {
    let editor: Editor;

    // editor中所有需要在视图中展示的属性需要同步维护在store中，方便实现视图状态更新
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
              state.activeChild = { ...child };
            });
          },
          onChangeActiveScene(scene) {
            set((state) => {
              state.activeScene = { ...scene };
            });
          },
          onChangeScenes(scenes) {
            set((state) => {
              // 此时传入的scenes和editor.scenes是同一个引用，需要重新解构赋值，触发视图更新
              state.scenes = [...scenes];
            });
          },
        });

        set((state) => {
          state.editor = editor;
        });
      },
    };
  }),
);
