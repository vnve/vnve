import { useEditorStore } from "@/store";
import { Graphics } from "@vnve/next-core";
import { ColorPicker } from "@/components/ui/color-picker";

export function ChildGraphicsStyle() {
  const editor = useEditorStore((state) => state.editor);
  const activeChild = useEditorStore((state) => state.activeChild) as Graphics;

  const handleChangeFill = (value: string) => {
    editor.updateActiveChild((child: Graphics) => {
      const width = child.width;
      const height = child.height;

      child.fillColor = value;
      child.clear().beginFill(value).drawRect(0, 0, width, height).endFill();
    });
  };

  return (
    <div>
      <h3>ChildGraphicsStyle</h3>
      <ul>
        <li>
          color:
          <ColorPicker
            value={activeChild.fillColor}
            onChange={handleChangeFill}
          ></ColorPicker>
        </li>
      </ul>
    </div>
  );
}
