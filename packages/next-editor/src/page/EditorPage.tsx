import DirectiveInput from "@/components/DirectiveInput";
import { Button } from "@/components/ui/button";
import { useEditorStore } from "@/store";
import { Scene } from "@vnve/next-core";
import { useEffect } from "react";

export default function EditorPage() {
  const initEditor = useEditorStore((state) => state.initEditor);
  const editor = useEditorStore((state) => state.editor);
  const activeChild = useEditorStore((state) => state.activeChild);
  const activeScene = useEditorStore((state) => state.activeScene);
  const scenes = useEditorStore((state) => state.scenes);
  const updateActiveScene = useEditorStore((state) => state.updateActiveScene);

  useEffect(() => {
    initEditor(document.getElementById("editor") as HTMLCanvasElement);
  }, [initEditor]);

  console.log("xxxxx");

  return (
    <div>
      <button
        onClick={() => {
          editor.addScene(new Scene());
        }}
      >
        add Scene
      </button>
      <button
        onClick={() => {
          updateActiveScene((scene) => {
            scene.name = "new name";
          });
        }}
      >
        changeActiveScene
      </button>
      scenes:
      <ul>
        {editor?.scenes.map((scene) => (
          <li key={scene.name} onClick={() => editor.setActiveScene(scene)}>
            {scene.name}
          </li>
        ))}
      </ul>
      activeScene: <div>{editor?.activeScene?.name}</div>
      canvas: <canvas id="editor"></canvas>
      <h1>Editor Page</h1>
      <DirectiveInput></DirectiveInput>
      Button: <Button>Click me</Button>
    </div>
  );
}
