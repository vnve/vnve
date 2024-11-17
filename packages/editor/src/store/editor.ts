import { create } from "zustand";
import { Child, Editor, Scene, Text } from "@vnve/core";
import { immer } from "zustand/middleware/immer";
import { DBProject } from "@/db";

export const useEditorStore = create<{
  project: Pick<DBProject, "id" | "name"> | null;
  editor: Editor;
  activeChild: Child | null;
  activeScene: Scene | null;
  scenes: Scene[];
  initEditor(view: HTMLCanvasElement): void;
  setProject(project: DBProject | null): void;
  updateActiveChild(fn: (child: Child) => void): void;
  updateActiveScene(fn: (scene: Scene) => void): void;
}>()(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  immer<any>((set) => {
    let editor: Editor;

    // editor中所有需要在视图中展示的属性需要同步维护在store中，方便实现视图状态更新
    // editor中，activeChild和activeScene内部属性的更新，必须通过update方法来更新，直接修改editor中的属性无法完成视图状态更新
    return {
      project: null,
      editor: null, // editor仅提供方法调用，内部属性不用作状态同步
      activeChild: null,
      activeScene: null,
      scenes: [],
      setProject(project: DBProject) {
        set((state) => {
          state.project = {
            id: project.id,
            name: project.name,
          };
        });
      },
      initEditor(view: HTMLCanvasElement) {
        editor = new Editor({
          view,
          onChangeActiveChild(child) {
            set((state) => {
              if (!child) {
                state.activeChild = null;
                return;
              }

              let newChild = {
                ...child,
                // child上部分属性是在prototype上的，需要手动拷贝到新对象上
                width: child.width,
                height: child.height,
                x: child.x,
                y: child.y,
              };

              if (child.type === "Text") {
                const textChild = child as Text;

                newChild = {
                  ...newChild,
                  text: textChild.text,
                  // textChild.style上部分属性是在prototype上的，需要手动拷贝到新对象上
                  style: textChild.style && {
                    ...textChild.style,
                    fontFamily: textChild.style.fontFamily,
                    fontWeight: textChild.style.fontWeight,
                    fontStyle: textChild.style.fontStyle,
                    fontSize: textChild.style.fontSize,
                    fill: textChild.style.fill,
                  },
                } as Text;
              }

              state.activeChild = newChild;
            });
          },
          onChangeActiveScene(scene) {
            set((state) => {
              if (scene) {
                state.activeScene = { ...scene };
              } else {
                state.activeScene = null;
              }
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
