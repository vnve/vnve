import { useRef, useState } from "react";
import { DirectiveInput } from "./DirectiveInput";
import { Button } from "@/components/ui/button";
import { useEditorStore } from "@/store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialogue, Text } from "@vnve/core";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DirectiveSpeakForm } from "@/components/plate-ui/directive-speak-form";
import { Switch } from "@/components/ui/switch";
import { linesToText } from "@/lib/utils";
import { AudioLines } from "lucide-react";

export function SceneDetail({ onClose }: { onClose?: () => void }) {
  const editor = useEditorStore((state) => state.editor);
  const project = useEditorStore((state) => state.project);
  const activeScene = useEditorStore((state) => state.activeScene);
  const [isOpenSaveAsTemplateDialog, setIsOpenSaveAsTemplateDialog] =
    useState(false);
  const scrollAreaRef = useRef(null);

  const handleChangeSpeak = (speak) => {
    editor.updateActiveScene((scene) => {
      scene.config.speak = speak;
    });
  };

  const handleChangeAutoShowBackground = (value) => {
    editor.updateActiveScene((scene) => {
      scene.config.autoShowBackground = value;
    });
  };

  const handleAddDialogue = (index?: number) => {
    const { config } = activeScene;

    editor.addDialogue(
      {
        speak: editor.cloneDialogueSpeak(config.speak),
        lines: [],
      },
      index,
    );
    scrollToBottom();
  };

  const handleInsertDialogue = (index: number, dialogue: Dialogue) => {
    editor.addDialogue(
      {
        speak: {
          ...editor.cloneDialogueSpeak(dialogue.speak),
          voice: undefined, // 插入时不复制语音
        },
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

      if (speaker) {
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
        const speakText = linesToText(value.lines);

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

  const scrollToBottom = () => {
    setTimeout(() => {
      if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollToBottom();
      }
    }, 100);
  };

  return (
    <Card className="w-full flex-1 h-full border-0 md:border shadow-none md:shadow rounded-md">
      <CardContent className="h-full p-1 md:p-2">
        {activeScene ? (
          <>
            <ScrollArea className="w-full h-full pr-2" ref={scrollAreaRef}>
              <div className="flex flex-col m-1 mr-0 pr-1">
                <div className="flex flex-col gap-1">
                  <Label
                    htmlFor="sceneName"
                    className="flex justify-between items-center"
                  >
                    <span>场景标题</span>
                    <div className="flex items-center">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button size="sm" variant="ghost">
                            <Icons.settings className="size-4"></Icons.settings>
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent>
                          <div className="flex flex-col">
                            <h3 className="text-base font-bold">场景设置</h3>
                            <DirectiveSpeakForm
                              speak={activeScene.config.speak}
                              onChangeSpeak={handleChangeSpeak}
                              disableCustomName={true}
                            ></DirectiveSpeakForm>
                            <div className="flex mt-2">
                              <span className="text-sm font-medium w-[8rem]">
                                自动展示背景
                              </span>
                              <Switch
                                checked={activeScene.config.autoShowBackground}
                                onCheckedChange={handleChangeAutoShowBackground}
                              />
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                setIsOpenSaveAsTemplateDialog(true)
                              }
                            >
                              <Icons.bookmark className="size-4"></Icons.bookmark>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>保存为模版</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      {onClose && (
                        <Button
                          className="-mr-3"
                          size="sm"
                          variant="ghost"
                          onClick={onClose}
                        >
                          <Icons.close className="size-4"></Icons.close>
                        </Button>
                      )}
                    </div>
                  </Label>
                  <Input
                    type="text"
                    id="sceneName"
                    placeholder="请输入场景标题"
                    value={activeScene.label}
                    onChange={(event) =>
                      handleChangeSceneName(event.target.value)
                    }
                  />
                </div>
                <div className="flex flex-col gap-2 mt-4">
                  <Label className="flex justify-between items-center">
                    <span>场景对白</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button size="sm" variant="ghost">
                            <AudioLines className="size-4"></AudioLines>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>批量生成当前场景中所有对白的音频</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
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
                <Button className="mt-2" onClick={() => handleAddDialogue()}>
                  新增对白
                </Button>
              </div>
            </ScrollArea>
            <SaveAsTemplateDialog
              isOpen={isOpenSaveAsTemplateDialog}
              onClose={() => setIsOpenSaveAsTemplateDialog(false)}
              sceneName={activeScene.name}
            ></SaveAsTemplateDialog>
          </>
        ) : (
          <div className="h-full text-lg flex items-center justify-center text-muted-foreground/50">
            {project ? "请先创建场景" : "请先创建或打开作品"}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
