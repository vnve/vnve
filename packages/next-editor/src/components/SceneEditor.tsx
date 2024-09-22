import { Button } from "@/components/ui/button";
import { useEditorStore } from "@/store";
import { Text } from "@vnve/next-core";
import { useEffect } from "react";

export function SceneEditor() {
  const initEditor = useEditorStore((state) => state.initEditor);
  const editor = useEditorStore((state) => state.editor);
  const activeChild = useEditorStore((state) => state.activeChild);
  const activeScene = useEditorStore((state) => state.activeScene);

  useEffect(() => {
    initEditor(document.getElementById("editor") as HTMLCanvasElement);
  }, [initEditor]);

  function addText() {
    const text = new Text("123123123123123", {
      fill: 0xffffff,
    });
    text.label = "文字";
    text.x = 100;
    editor.addChild(text);
  }

  return (
    <>
      {activeScene && (
        <div>
          <Button onClick={addText}>增加文字</Button>
          <div>
            activeChild:
            <div>
              {activeChild?.label} {activeChild?.name}
            </div>
          </div>
        </div>
      )}
      <canvas id="editor" className="w-[960px] h-[540px]"></canvas>
    </>
  );
}
