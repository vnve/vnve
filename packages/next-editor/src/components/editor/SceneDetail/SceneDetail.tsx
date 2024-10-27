import * as React from "react";
import { DirectiveInput } from "./DirectiveInput";
import { Button } from "@/components/ui/button";
import { useEditorStore } from "@/store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialogue, Text } from "@vnve/next-core";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { SaveAsTemplateDialog } from "../TemplateLibrary";
import { Icons } from "@/components/icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function SceneDetail() {
  const editor = useEditorStore((state) => state.editor);
  const activeScene = useEditorStore((state) => state.activeScene);

  const handleAddDialogue = (index?: number) => {
    const { config } = activeScene;

    editor.addDialogue(
      {
        speak: editor.cloneDialogueSpeak(config.speak),
        lines: [],
      },
      index,
    );
  };

  const handleInsertDialogue = (index: number, dialogue: Dialogue) => {
    editor.addDialogue(
      {
        speak: editor.cloneDialogueSpeak(dialogue.speak),
        lines: [],
      },
      index,
    );
  };

  const handleChangeSceneName = (value: string) => {
    editor.updateActiveScene((scene) => {
      scene.label = value;
    });
  };

  const handleFocusDialogue = (index: number, value: Dialogue) => {
    // 单向同步至画布元素，只改变画布中的值
    // 此时activeScene没有更新，使用editor.activeScene
    if (editor.activeScene) {
      const { speaker, targetName: textTargetName } =
        editor.activeScene.config.speak || {};

      if (value.speak.speaker.name && speaker) {
        const nameChild = editor.activeScene.getChildByName(
          speaker.targetName,
        ) as Text;

        if (nameChild) {
          nameChild.text = value.speak.speaker.name;
        }
      }

      if (value.lines.length > 0) {
        const textChild = editor.activeScene.getChildByName(
          textTargetName,
        ) as Text;
        let speakText = "";

        value.lines.forEach((line) => {
          if (line.type === "p") {
            for (let index = 0; index < line.children.length; index++) {
              const child = line.children[index];

              if (!child.type) {
                let text = child.text;

                if (index === line.children.length - 1) {
                  // 最后一个元素是文本，增加换行符
                  text += "\n";
                }

                speakText += text;
              }
            }
          }
        });

        if (speakText && textChild) {
          textChild.text = speakText;
        }
      }
    }
  };

  const handleUpdateDialogue = (index: number, value: Dialogue) => {
    editor.updateDialogue(index, value);
    handleFocusDialogue(index, value);
  };

  const handleCopyDialogue = (dialogue: Dialogue, index?: number) => {
    const clonedDialogue = editor.cloneDialogue(dialogue);

    editor.addDialogue(clonedDialogue, index);
  };

  const handleSwapDialogue = (fromIndex: number, toIndex: number) => {
    editor.swapDialogue(fromIndex, toIndex);
  };

  return (
    <>
      {activeScene && (
        <Card className="w-full flex-1 h-full rounded-md">
          <CardContent className="h-full p-2">
            <ScrollArea className="w-full h-full pr-2">
              <div className="flex flex-col m-1 mr-0 pr-1">
                <div className="flex flex-col gap-1">
                  <Label
                    htmlFor="sceneName"
                    className="flex justify-between items-center"
                  >
                    <span>场景名称</span>
                    <SaveAsTemplateDialog sceneName={activeScene.name}>
                      <Button size="sm" variant="outline">
                        保存为模版
                      </Button>
                    </SaveAsTemplateDialog>
                  </Label>
                  <Input
                    type="text"
                    id="sceneName"
                    placeholder="请输入场景名称"
                    value={activeScene.label}
                    onChange={(event) =>
                      handleChangeSceneName(event.target.value)
                    }
                  />
                </div>
                <div className="flex flex-col gap-2 mt-4">
                  <Label>场景对白</Label>
                  {activeScene.dialogues.map((dialogue, index) => {
                    return (
                      <div key={index}>
                        <DirectiveInput
                          value={dialogue}
                          onChange={(value) =>
                            handleUpdateDialogue(index, value)
                          }
                          onFocus={(value) => handleFocusDialogue(index, value)}
                        >
                          <DropdownMenu>
                            <DropdownMenuTrigger>
                              <Icons.more className="size-4 cursor-pointer mx-1" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleInsertDialogue(index + 1, dialogue)
                                }
                              >
                                插入
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleCopyDialogue(dialogue, index + 1)
                                }
                              >
                                复制
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => {
                                  editor.removeDialogue(dialogue);
                                }}
                              >
                                删除
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {index > 0 && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleSwapDialogue(index, index - 1)
                                  }
                                >
                                  上移
                                </DropdownMenuItem>
                              )}

                              {index < activeScene.dialogues.length - 1 && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleSwapDialogue(index, index + 1)
                                  }
                                >
                                  下移
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </DirectiveInput>
                      </div>
                    );
                  })}
                </div>
                <Button
                  className="mt-2"
                  size="sm"
                  onClick={() => handleAddDialogue()}
                >
                  新增对白
                </Button>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </>
  );
}
