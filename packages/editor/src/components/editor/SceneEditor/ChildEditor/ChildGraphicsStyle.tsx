import { useEditorStore } from "@/store";
import { Graphics } from "@vnve/core";
import { ColorPicker } from "@/components/ui/color-picker";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAssetLibrary } from "@/components/hooks/useAssetLibrary";
import { DBAssetType } from "@/db";
import { createSprite } from "@/lib/core";

export function ChildGraphicsStyle() {
  const editor = useEditorStore((state) => state.editor);
  const activeChild = useEditorStore((state) => state.activeChild) as Graphics;
  const { selectAsset } = useAssetLibrary();

  const handleChangeFill = (value: string) => {
    editor.updateActiveChild((child: Graphics) => {
      const width = child.width;
      const height = child.height;

      child.fillColor = value;
      child.clear().beginFill(value).drawRect(0, 0, width, height).endFill();
    });
  };

  const handleReplaceWithCustomDialog = async () => {
    const asset = await selectAsset(DBAssetType.Dialog);
    const dialogSprite = await createSprite(asset, editor);

    editor.addChild(dialogSprite);
    editor.updateActiveScene((scene) => {
      scene.config.speak.dialogTargetName = dialogSprite.name;
    });
    editor.setActiveChildByName(dialogSprite.name);
    editor.removeChildByName(activeChild.name);
  };

  return (
    <div className="flex gap-2">
      <div className="flex-1 flex gap-1 items-center">
        <Label className="flex-shrink-0 mr-2">填充色</Label>
        <ColorPicker
          value={activeChild.fillColor}
          onChange={handleChangeFill}
          className="w-6 h-6"
        ></ColorPicker>
      </div>
      <Button size="sm" onClick={handleReplaceWithCustomDialog}>
        自定义对话框
      </Button>
    </div>
  );
}
