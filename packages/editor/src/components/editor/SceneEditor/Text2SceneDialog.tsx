import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { DBAssetType, db } from "@/db";
import { TextFileEditor } from "@/components//ui/text-file-editor";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import { AssetStateCard } from "@/components/editor/AssetLibrary/AssetCard";
import { useStoryConversion } from "@/components/hooks/useStoryConversion";
import { usePendingSceneStore } from "@/store/pendingScene";
import { useEditorStore } from "@/store";

interface Text2SceneDialogProps {
  isOpen: boolean;
  type: "formatter" | "ai";
  onClose: () => void;
  onSuccess?: () => void;
  initialImportInputText?: string;
}

export function Text2SceneDialog({
  isOpen,
  type,
  onClose,
  onSuccess,
  initialImportInputText,
}: Text2SceneDialogProps) {
  const editor = useEditorStore((state) => state.editor);
  const [aiInputText, setAiInputText] = useState("");
  const [loadingText, setLoadingText] = useState("");
  const setPendingData = usePendingSceneStore((state) => state.setPendingData);
  const isEditorReady = !!editor;

  function handleClose() {
    onClose();
    reset();
    setAiInputText("");
    setLoadingText("");
  }

  const handleSuccess = () => {
    onSuccess?.();
    handleClose();
  };

  // 自定义的完成处理函数
  const handleCustomFinish = async (): Promise<boolean> => {
    if (!isEditorReady) {
      // 如果没有 editor（在 HomePage 中），保存数据到 pending store
      const hasUnselectedCharacter = Object.entries(
        state.characterAssetMap,
      ).some(([, asset]) => !asset);
      const hasUnselectedBackground = Object.entries(
        state.backgroundAssetMap,
      ).some(([, asset]) => !asset);

      if (hasUnselectedCharacter) {
        return false;
      }

      if (hasUnselectedBackground) {
        return false;
      }

      // 生成智能项目名称
      const generateProjectName = async () => {
        try {
          // 获取所有项目的数量
          const projectCount = await db.project.count();

          // 新项目序号 = 已有项目数量 + 1
          const nextNumber = projectCount + 1;

          return `作品${nextNumber}`;
        } catch (error) {
          console.error("生成项目名称时出错:", error);
          return "x新品";
        }
      };

      const projectName = await generateProjectName();

      setPendingData({
        story: state.story,
        characterAssetMap: state.characterAssetMap,
        backgroundAssetMap: state.backgroundAssetMap,
        sceneTemplateName: state.sceneTemplateName,
        importInputText: state.importInputText,
        projectName,
      });

      handleSuccess();
      return true;
    } else {
      // 如果有 editor（在 EditorPage 中），直接生成场景
      return await handleFinish();
    }
  };

  const {
    state,
    updateState,
    handleAIConvert,
    handleImportStory,
    handleSelectCharacter,
    handleSelectBackground,
    handleNextStep,
    handleFinish,
    setSceneTemplate,
    reset,
  } = useStoryConversion({
    editor,
    onSuccess: handleSuccess,
    onError: () => setLoadingText(""),
  });

  const {
    step,
    importInputText,
    characterAssetMap,
    backgroundAssetMap,
    isProcessing,
  } = state;

  // 根据 type 设置初始步骤
  useEffect(() => {
    if (isOpen) {
      if (type === "formatter") {
        updateState({ step: 2 });
      } else if (type === "ai") {
        updateState({ step: 1 });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (initialImportInputText) {
      updateState({ importInputText: initialImportInputText });
    }
  }, [updateState, initialImportInputText]);

  const handleGoBack = () => {
    const minStep = type === "formatter" ? 2 : 1;
    updateState({ step: Math.max(minStep, step - 1) });
  };

  const handleAiOperation = async (
    type: "convert" | "generate",
    text: string,
  ) => {
    setLoadingText(type === "convert" ? "智能转换中" : "智能生成中");
    const result = await handleAIConvert(type, text);
    setLoadingText("");
    return result.success;
  };

  const handleImportOperation = async (text: string) => {
    setLoadingText("剧本导入中");
    const success = await handleImportStory(text);
    setLoadingText("");
    updateState({ step: 3 });
    return success;
  };

  // Step 1: AI功能
  const Step1 = () => (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Icons.sparkles className="size-5" />
          智能剧本
        </DialogTitle>
        <DialogDescription />
      </DialogHeader>
      <Tabs defaultValue="convert">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="convert" disabled={!!loadingText}>
            转换剧本
          </TabsTrigger>
          <TabsTrigger value="generate" disabled={!!loadingText}>
            生成剧本
          </TabsTrigger>
        </TabsList>
        <TabsContent value="convert">
          <TextFileEditor
            value={aiInputText}
            onChange={setAiInputText}
            placeholder="请输入小说、故事原文"
            loading={loadingText}
            onComplete={(text) => handleAiOperation("convert", text)}
          />
        </TabsContent>
        <TabsContent value="generate">
          <TextFileEditor
            value={aiInputText}
            onChange={setAiInputText}
            placeholder="请输入剧情大纲"
            loading={loadingText}
            onComplete={(text) => handleAiOperation("generate", text)}
          />
        </TabsContent>
      </Tabs>
    </>
  );

  // Step 2: 剧本展示
  const Step2 = () => (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">导入剧本</DialogTitle>
        <DialogDescription />
        <TextFileEditor
          value={importInputText}
          placeholder="请输入或者选择剧本文件"
          loading={loadingText}
          onChange={(text) => updateState({ importInputText: text })}
          onComplete={handleImportOperation}
          onChangeTemplate={setSceneTemplate}
        >
          {type === "ai" && (
            <Button variant="outline" onClick={handleGoBack}>
              返回
            </Button>
          )}
        </TextFileEditor>
      </DialogHeader>
    </>
  );

  // Step 3: 选择人物
  const Step3 = () => (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">选择角色</DialogTitle>
        <DialogDescription>
          根据剧本解析出以下角色，请选择角色对应的素材
        </DialogDescription>
      </DialogHeader>
      <ScrollArea>
        <div className="flex gap-1 pb-4">
          {characterAssetMap &&
            Object.keys(characterAssetMap).map((name) => {
              const asset = characterAssetMap[name];
              let state = { name, id: 0, ext: "" };

              if (asset) {
                const hit =
                  asset.states.find((state) => state.id === asset.stateId) ||
                  asset.states[0];
                state = { ...hit, name };
              }

              return (
                <AssetStateCard
                  key={name}
                  type={DBAssetType.Character}
                  state={state}
                  onSelect={() => handleSelectCharacter(name)}
                />
              );
            })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      <div className="flex justify-between">
        <Button variant="outline" onClick={handleGoBack}>
          返回
        </Button>
        <Button onClick={handleNextStep}>下一步</Button>
      </div>
    </>
  );

  // Step 4: 选择场景
  const Step4 = () => (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">选择场景</DialogTitle>
        <DialogDescription>
          根据剧本解析出以下场景，请选择场景对应的素材
        </DialogDescription>
      </DialogHeader>
      <ScrollArea>
        <div className="flex gap-1 pb-4">
          {backgroundAssetMap &&
            Object.keys(backgroundAssetMap).map((name) => {
              const asset = backgroundAssetMap[name];
              let state = { name, id: 0, ext: "" };

              if (asset) {
                const hit =
                  asset.states.find((state) => state.id === asset.stateId) ||
                  asset.states[0];
                state = { ...hit, name };
              }

              return (
                <AssetStateCard
                  key={name}
                  type={DBAssetType.Background}
                  state={state}
                  onSelect={() => handleSelectBackground(name)}
                />
              );
            })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      <div className="flex justify-between">
        <Button
          variant="outline"
          disabled={!!loadingText || isProcessing}
          onClick={handleGoBack}
        >
          返回
        </Button>
        <Button
          disabled={!!loadingText || isProcessing}
          onClick={handleCustomFinish}
        >
          {(loadingText || isProcessing) && (
            <Loader2 className="animate-spin mr-1" />
          )}
          {loadingText ? loadingText : isEditorReady ? "生成" : "下一步"}
        </Button>
      </div>
    </>
  );

  const Steps = [Step1, Step2, Step3, Step4];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className="min-w-[70vw]"
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        {step > 0 && Steps[step - 1]()}
      </DialogContent>
    </Dialog>
  );
}
