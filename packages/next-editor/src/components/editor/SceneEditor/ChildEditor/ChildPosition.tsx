import { Button } from "@/components/ui/button";
import { useEditorStore } from "@/store";
import { EditorChildPosition, Sprite } from "@vnve/next-core";
import { Icons } from "@/components/icons";
import { ScrollArea } from "@/components/ui/scroll-area";

export function ChildPosition() {
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
    <ScrollArea className="h-full pr-2">
      {activeChild && (
        <div className="flex flex-col gap-2">
          <fieldset className="rounded-md border p-1">
            <legend className="-ml-1 px-1 text-sm font-medium">层级</legend>
            <div className="flex justify-between items-center">
              <div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleChangeZIndex("top")}
                >
                  置顶
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleChangeZIndex("up")}
                >
                  上移
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleChangeZIndex("down")}
                >
                  下移
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleChangeZIndex("bottom")}
                >
                  置底
                </Button>
              </div>
              <div>
                <Button size="sm" variant="ghost" onClick={handleCopy}>
                  <Icons.copy className="size-4"></Icons.copy>
                </Button>
                <Button size="sm" variant="ghost" onClick={handleDelete}>
                  <Icons.delete className="size-4"></Icons.delete>
                </Button>
              </div>
            </div>
          </fieldset>
          <fieldset className="rounded-md border p-1">
            <legend className="-ml-1 px-1 text-sm font-medium">水平位置</legend>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleChangePosition("left")}
            >
              左
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleChangePosition("near-left")}
            >
              1/3
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleChangePosition("center")}
            >
              中
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleChangePosition("near-right")}
            >
              2/3
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleChangePosition("right")}
            >
              右
            </Button>
          </fieldset>
          <fieldset className="rounded-md border p-1">
            <legend className="-ml-1 px-1 text-sm font-medium">垂直位置</legend>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleChangePosition("top")}
            >
              上
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleChangePosition("middle")}
            >
              中
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleChangePosition("bottom")}
            >
              下
            </Button>
          </fieldset>
        </div>
      )}
    </ScrollArea>
  );
}
