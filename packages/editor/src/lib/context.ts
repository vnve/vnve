import { Creator, Editor, Child, Scene } from "@vnve/core";
import { createContext } from "react";

let _editor: Editor;

export function setEditor(editor: Editor) {
  _editor = editor;
}

export function getEditor() {
  return _editor;
}

export const EditorContext = createContext<{
  activeChild?: Child;
  activeScene?: Scene;
  scenes: Scene[];
  setActiveChild: React.Dispatch<React.SetStateAction<Child | undefined>>;
  setActiveScene: React.Dispatch<React.SetStateAction<Scene | undefined>>;
  setScenes: React.Dispatch<React.SetStateAction<Scene[]>>;
}>({} as any);
