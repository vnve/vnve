import { Button } from "@/components/ui/button";
import { useEditorStore } from "@/store";
import { useEffect } from "react";
import { useAssetLibrary } from "@/hooks";
import { DBAssetType } from "@/db";
import { createSprite } from "@/lib/core";

export function SceneEditor() {
  const initEditor = useEditorStore((state) => state.initEditor);
  const editor = useEditorStore((state) => state.editor);
  const activeChild = useEditorStore((state) => state.activeChild);
  const activeScene = useEditorStore((state) => state.activeScene);
  const { selectAsset } = useAssetLibrary();

  useEffect(() => {
    initEditor(document.getElementById("editor") as HTMLCanvasElement);
  }, [initEditor]);

  async function addCharacter() {
    const asset = await selectAsset(DBAssetType.Character);

    if (asset) {
      const character = await createSprite(asset, editor);

      editor.addChild(character);
    }
  }

  async function addBackground() {
    const asset = await selectAsset(DBAssetType.Background);

    if (asset) {
      const background = await createSprite(asset, editor);

      editor.addChild(background);
    }
  }

  function addThing() {
    //
  }

  return (
    <>
      {activeScene && (
        <div>
          <Button onClick={addCharacter}>增加角色</Button>
          <Button onClick={addBackground}>增加背景</Button>
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
