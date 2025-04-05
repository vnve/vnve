import { useEditorStore } from "@/store";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

export function ChildBasicStyle() {
  const editor = useEditorStore((state) => state.editor);
  const activeChild = useEditorStore((state) => state.activeChild);

  const handleInputValueChange =
    (key: string, type?: "number") =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      editor.updateActiveChild((child) => {
        if (type === "number") {
          child[key] = Number(e.target.value);
        } else {
          child[key] = e.target.value;
        }
      });
    };

  const handleSelectValueChange = (key: string) => (value: string | number) => {
    editor.updateActiveChild((child) => {
      child[key] = value;
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <div className="flex-1 flex gap-1 items-center">
          <Label className="w-5">宽</Label>
          <Input
            value={activeChild.width.toFixed(0)}
            onChange={handleInputValueChange("width", "number")}
            type="number"
            min={0}
            step={10}
            className="h-6"
          />
        </div>
        <div className="flex-1 flex gap-1 items-center">
          <Label className="w-5">高</Label>
          <Input
            value={activeChild.height.toFixed(0)}
            onChange={handleInputValueChange("height", "number")}
            type="number"
            min={0}
            step={10}
            className="h-6"
          />
        </div>
      </div>
      <div className="flex gap-2">
        <div className="flex-1 flex gap-1 items-center">
          <Label className="w-5">X</Label>
          <Input
            value={activeChild.x.toFixed(0)}
            onChange={handleInputValueChange("x", "number")}
            type="number"
            min={0}
            step={10}
            className="h-6"
          />
        </div>
        <div className="flex-1 flex gap-1 items-center">
          <Label className="w-5">Y</Label>
          <Input
            value={activeChild.y.toFixed(0)}
            onChange={handleInputValueChange("y", "number")}
            type="number"
            min={0}
            step={10}
            className="h-6"
          />
        </div>
      </div>
      <div className="flex-1 flex gap-1 items-center">
        <Label className="flex-shrink-0 mr-2">透明度</Label>
        <Slider
          min={0}
          max={1}
          step={0.1}
          value={[activeChild.alpha]}
          onValueChange={(value) => handleSelectValueChange("alpha")(value[0])}
          showPercentage={true}
        />
      </div>
    </div>
  );
}
