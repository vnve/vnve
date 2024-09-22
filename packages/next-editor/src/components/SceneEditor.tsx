import { Button } from "@/components/ui/button";
import { useEditorStore } from "@/store";
import { useEffect } from "react";

export function SceneEditor() {
  const initEditor = useEditorStore((state) => state.initEditor);
  const editor = useEditorStore((state) => state.editor);
  const activeChild = useEditorStore((state) => state.activeChild);
  const activeScene = useEditorStore((state) => state.activeScene);

  useEffect(() => {
    initEditor(document.getElementById("editor") as HTMLCanvasElement);
  }, [initEditor]);

  function addCharacter() {
    //
  }

  function addBackground() {
    //
  }

  function addThing() {
    //
  }

  return (
    <>
      {activeScene && (
        <div>
          <Button onClick={addCharacter}>增加角色</Button>
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
