import { useEditorStore } from "@/store";
import { Child, Sound, Sprite } from "@vnve/core";
import { useMemo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DBAssetType } from "@/db";
import { Icons } from "@/components/icons";

export function ChildList() {
  const editor = useEditorStore((state) => state.editor);
  const activeChild = useEditorStore((state) => state.activeChild);
  const activeScene = useEditorStore((state) => state.activeScene);

  const childGroupList = useMemo(() => {
    if (!activeScene) {
      return [];
    }

    const characters = [];
    const things = [];
    const backgrounds = [];
    const others = [];
    const sounds = activeScene.sounds;

    for (const child of activeScene.children) {
      if ((child as Sprite).assetType === DBAssetType.Character) {
        characters.push(child);
      } else if ((child as Sprite).assetType === DBAssetType.Background) {
        backgrounds.push(child);
      } else if ((child as Sprite).assetType === DBAssetType.Thing) {
        things.push(child);
      } else if (child.name) {
        others.push(child);
      }
    }

    return [
      {
        label: "角色",
        children: characters,
      },
      {
        label: "物品",
        children: things,
      },
      {
        label: "背景",
        children: backgrounds,
      },
      {
        label: "其他",
        children: others,
      },
      {
        label: "音频",
        children: sounds,
      },
    ];
  }, [activeScene]);

  const handleSelectChild = (child: Child | Sound) => {
    if ((child as Sound).assetType === DBAssetType.Audio) {
      return;
    }

    editor.setActiveChildByName(child.name);
  };

  const handleRemoveChild = (child: Child | Sound) => {
    if ((child as Sound).assetType === DBAssetType.Audio) {
      editor.removeSoundByName(child.name);

      return;
    }

    editor.removeChildByName(child.name);

    if (activeChild?.name === child.name) {
      editor.setActiveChild(undefined);
    }
  };

  const handleToggleChildVisible = (child: Child) => {
    editor.toggleChildVisibleByName(child.name);
  };

  const handleToggleChildInteractive = (child: Child) => {
    editor.toggleChildInteractiveByName(child.name);
  };

  return (
    <ScrollArea className="h-full pr-2">
      <div className="space-y-4">
        {childGroupList.map(
          (group) =>
            group.children.length > 0 && (
              <fieldset className="rounded-md border p-2" key={group.label}>
                <legend className="-ml-1 px-1 text-sm font-medium">
                  {group.label}
                </legend>
                <div className="flex flex-col gap-1">
                  {group.children.map((child) => (
                    <div
                      key={child.name}
                      className={`text-sm p-1 px-2 border rounded ${
                        activeChild?.name === child.name ? "bg-muted" : ""
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div
                          onClick={() => handleSelectChild(child)}
                          className="cursor-pointer flex-1"
                        >
                          {child.label}
                        </div>
                        <div className="flex space-x-2 items-center">
                          {child.assetType !== DBAssetType.Audio && (
                            <>
                              {child.visible ? (
                                <Icons.viewing
                                  onClick={() =>
                                    handleToggleChildVisible(child)
                                  }
                                  className="size-4 cursor-pointer"
                                />
                              ) : (
                                <Icons.viewingOff
                                  onClick={() =>
                                    handleToggleChildVisible(child)
                                  }
                                  className="size-4 cursor-pointer"
                                />
                              )}

                              {child.interactive ? (
                                <Icons.lockOpen
                                  onClick={() =>
                                    handleToggleChildInteractive(child)
                                  }
                                  className="size-4 cursor-pointer"
                                />
                              ) : (
                                <Icons.lock
                                  onClick={() =>
                                    handleToggleChildInteractive(child)
                                  }
                                  className="size-4 cursor-pointer"
                                />
                              )}
                            </>
                          )}
                          <Icons.trash2
                            onClick={() => handleRemoveChild(child)}
                            className="size-4 cursor-pointer hover:text-destructive"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </fieldset>
            ),
        )}
      </div>
    </ScrollArea>
  );
}
