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
import { linesToText } from "@/lib/utils";
import { AudioLines } from "lucide-react";
import { useToast } from "@/components/hooks/use-toast";
import { useLoading } from "@/components/hooks/useLoading";
import { useSettingsStore } from "@/store/settings";
import { genTTS } from "@/lib/core";
import { SceneSettingsDialog } from "./SceneSettingsDialog";
import { NONE_VOICE } from "@/lib/tts";

export function SceneDetail({ onClose }: { onClose?: () => void }) {
  const editor = useEditorStore((state) => state.editor);
  const project = useEditorStore((state) => state.project);
  const activeScene = useEditorStore((state) => state.activeScene);
  const [isOpenSaveAsTemplateDialog, setIsOpenSaveAsTemplateDialog] =
    useState(false);
  const [isOpenSceneSettingsDialog, setIsOpenSceneSettingsDialog] =
    useState(false);
  const scrollAreaRef = useRef(null);
  const ttsSettings = useSettingsStore((state) => state.tts);
  const { toast } = useToast();
  const { showLoading, updateLoadingText, hideLoading } = useLoading();

  const handleChangeSceneSettings = (settings) => {
    editor.updateActiveScene((scene) => {
      scene.config.autoShowBackground = settings.autoShowBackground;
      scene.config.speak = settings.speak;

      scene.dialogues.forEach((dialogue) => {
        dialogue.speak = {
          ...dialogue.speak,
          ...settings.speak,
          speaker: {
            ...(dialogue.speak.speaker || {}),
            wordsPerMin: settings.speak.speaker.wordsPerMin,
            interval: settings.speak.speaker.interval,
            effect: settings.speak.speaker.effect,
            effectDuration: settings.speak.speaker.effectDuration,
            autoShowSpeaker: settings.speak.speaker.autoShowSpeaker,
            autoMaskOtherSpeakers: settings.speak.speaker.autoMaskOtherSpeakers,
          },
          voice: {
            ...(dialogue.speak.voice || {}),
            volume: settings.speak.voice.volume,
          },
        };
      });
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

    // 复制时默认不复制语音
    clonedDialogue.speak.voice = undefined;

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

  const handleBatchGenerateTTS = async () => {
    if (!ttsSettings || !ttsSettings.appid || !ttsSettings.token) {
      toast({
        title: "请先完成语音合成设置",
        variant: "destructive",
      });
      return;
    }

    const dialogues = activeScene.dialogues;

    showLoading("配音生成中");

    try {
      for (const [index, dialogue] of dialogues.entries()) {
        updateLoadingText(`正在生成第 ${index + 1} 条对白`);

        try {
          const { sound } = await genTTS({
            speak: dialogue.speak,
            lines: dialogue.lines,
            editor,
            project,
            ttsSettings,
          });

          editor.updateDialogue(index, {
            ...dialogue,
            speak: {
              ...dialogue.speak,
              voice: {
                ...(dialogue.speak.voice || {}),
                targetName: sound.name,
              },
            },
          });
        } catch (error) {
          if (error.voice === NONE_VOICE) {
            // 音色配置为空，批量场景直接跳过处理
          } else {
            throw error;
          }
        }
      }
      toast({
        title: "场景对白生成成功!",
      });
    } catch (error) {
      toast({
        title: "配音生成失败",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      hideLoading();
    }
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
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setIsOpenSceneSettingsDialog(true)}
                            >
                              <Icons.settings className="size-4"></Icons.settings>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>场景设置</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

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
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleBatchGenerateTTS}
                          >
                            <AudioLines className="size-4"></AudioLines>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>批量生成当前场景中所有的对白配音</p>
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
            {isOpenSaveAsTemplateDialog && (
              <SaveAsTemplateDialog
                isOpen={isOpenSaveAsTemplateDialog}
                onClose={() => setIsOpenSaveAsTemplateDialog(false)}
                sceneName={activeScene.name}
              ></SaveAsTemplateDialog>
            )}
            {isOpenSceneSettingsDialog && (
              <SceneSettingsDialog
                isOpen={isOpenSceneSettingsDialog}
                speak={activeScene.config.speak}
                autoShowBackground={activeScene.config.autoShowBackground}
                onConfirm={handleChangeSceneSettings}
                onClose={() => setIsOpenSceneSettingsDialog(false)}
              />
            )}
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
