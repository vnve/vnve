import { Button } from "@/components/ui/button";
import { useEditorStore } from "@/store";
import { EditorChildPosition, Sprite } from "@vnve/core";
import { Icons } from "@/components/icons";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DBAssetType } from "@/db";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function ChildPosition() {
  const editor = useEditorStore((state) => state.editor);
  const activeChild = useEditorStore((state) => state.activeChild);

  const handleFlip = () => {
    if (editor.activeChild) {
      const sprite = editor.activeChild as Sprite;

      sprite.scale.x *= -1;

      if (sprite.scale.x < 0) {
        sprite.x += sprite.width;
      } else {
        sprite.x -= sprite.width;
      }
    }
  };

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

  const handleAutoChangePosition = () => {
    //根据角色人数，自动排列
    const characters = editor.activeScene.getChildrenByAssetType(
      DBAssetType.Character,
    );
    const characterTotal = characters.length;
    let characterIndex = 1;

    for (const character of characters) {
      character.x =
        (editor.options.width / (characterTotal + 1)) * characterIndex -
        character.width / 2;
      character.y = editor.options.height - character.height;

      characterIndex++;
    }
  };

  return (
    <ScrollArea className="h-full pr-2">
      {activeChild && (
        <div>
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
                {activeChild.type !== "Graphics" && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button size="sm" variant="ghost" onClick={handleFlip}>
                          <Icons.flip className="size-4"></Icons.flip>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>镜像翻转</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button size="sm" variant="ghost" onClick={handleCopy}>
                        <Icons.copy className="size-4"></Icons.copy>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>复制</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button size="sm" variant="ghost" onClick={handleDelete}>
                        <Icons.delete className="size-4"></Icons.delete>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>删除</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </fieldset>
          <fieldset className="rounded-md border p-1 mt-2">
            <legend className="-ml-1 px-1 text-sm font-medium">水平位置</legend>
            <div className="flex justify-between">
              <div>
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
              </div>
              {(activeChild as Sprite).assetType === DBAssetType.Character && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleAutoChangePosition}
                      >
                        自动
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>根据角色人数，自动排列全部角色</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </fieldset>
          <fieldset className="rounded-md border p-1 mt-2">
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
