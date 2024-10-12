import { useEditorStore } from "@/store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChildTextStyle } from "./ChildTextStyle";
import { ChildGraphicsStyle } from "./ChildGraphicsStyle";
import { EditorChildPosition, Sprite } from "@vnve/next-core";
import { Slider } from "@/components/ui/slider";

export function ChildStyle() {
  const editor = useEditorStore((state) => state.editor);
  const activeChild = useEditorStore((state) => state.activeChild);

  const handleCopy = async () => {
    const cloned = editor.cloneChild();

    if (cloned.type === "Sprite") {
      const clonedSprite = cloned as Sprite;

      await clonedSprite.load();
    }

    cloned.x += cloned.width * 0.1;
    cloned.y += cloned.height * 0.1;

    editor.addChild(cloned);
    editor.setActiveChildByName(cloned.name);
  };

  const handleDelete = () => {
    if (editor.activeChild) {
      editor.removeChildByName(editor.activeChild.name);
    }
    editor.setActiveChild(undefined);
  };

  const handleChangeZIndex = (type: "top" | "bottom" | "up" | "down") => () => {
    switch (type) {
      case "top":
        editor.moveChildToTop();
        break;
      case "bottom":
        editor.moveChildToBottom();
        break;
      case "up":
        editor.moveUpChild();
        break;
      case "down":
        editor.moveDownChild();
        break;
    }
  };

  const handleChangePosition = (type: EditorChildPosition) => () => {
    editor.setChildPosition(type);
  };

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

  // TODO: 可以使用fieldset和legend来组织

  return (
    <div>
      <h3>ChildStyle</h3>
      {activeChild && (
        <ul>
          <li>
            <Button onClick={handleCopy}>复制</Button>
            <Button onClick={handleDelete}>删除</Button>
          </li>
          <li>
            层级：
            <Button onClick={handleChangeZIndex("top")}>置顶</Button>
            <Button onClick={handleChangeZIndex("up")}>上移一层</Button>
            <Button onClick={handleChangeZIndex("down")}>下移一层</Button>
            <Button onClick={handleChangeZIndex("bottom")}>置底</Button>
          </li>
          <li>
            水平位置:
            <Button onClick={handleChangePosition("left")}>左</Button>
            <Button onClick={handleChangePosition("near-left")}>偏左</Button>
            <Button onClick={handleChangePosition("center")}>中</Button>
            <Button onClick={handleChangePosition("near-right")}>偏右</Button>
            <Button onClick={handleChangePosition("right")}>右</Button>
          </li>
          <li>
            垂直位置:
            <Button onClick={handleChangePosition("top")}>上</Button>
            <Button onClick={handleChangePosition("middle")}>中</Button>
            <Button onClick={handleChangePosition("bottom")}>下</Button>
          </li>
          <li>
            Width:
            <Input
              value={activeChild.width}
              onChange={handleInputValueChange("width", "number")}
              type="number"
              min={0}
              step={10}
            ></Input>
          </li>
          <li>
            Height:
            <Input
              value={activeChild.height}
              onChange={handleInputValueChange("height", "number")}
              type="number"
              min={0}
              step={10}
            ></Input>
          </li>
          <li>
            X:
            <Input
              value={activeChild.x}
              onChange={handleInputValueChange("x", "number")}
              type="number"
              min={0}
              step={10}
            />
          </li>
          <li>
            Y:
            <Input
              value={activeChild.y}
              onChange={handleInputValueChange("y", "number")}
              type="number"
              min={0}
              step={10}
            />
          </li>
          <li>
            Opacity:
            <Slider
              min={0}
              max={1}
              step={0.1}
              value={[activeChild.alpha]}
              onValueChange={(value) =>
                handleSelectValueChange("alpha")(value[0])
              }
            />
          </li>
          <li>层级:</li>
          {activeChild.type === "Text" && <ChildTextStyle />}
          {activeChild.type === "Graphics" && <ChildGraphicsStyle />}
        </ul>
      )}
    </div>
  );
}
