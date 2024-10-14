import { Button } from "@/components/ui/button";
import { useEditorStore } from "@/store";
import { EditorChildPosition, Sprite } from "@vnve/next-core";
import { Icons } from "@/components/icons";

export function ChildToolbar() {
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

  return (
    <div className="flex flex-col w-8 bg-white rounded-sm border p-1 gap-1 absolute top-0 right-0">
      <Icons.delete className="w-6 h-6" onClick={handleCopy} />
      <Icons.delete className="w-6 h-6" onClick={handleDelete} />
    </div>
  );

  return (
    activeChild && (
      // TODO: 快捷操作部分移动至画布右侧
      <ul className="flex flex-col fixed top-0 left-0 z-50">
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
      </ul>
    )
  );
}
