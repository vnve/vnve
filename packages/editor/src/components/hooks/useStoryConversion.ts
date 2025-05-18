import { useState } from "react";
import { useAssetLibrary } from "./useAssetLibrary";
import { parseStory, story2Scenes, story2Text, text2Story } from "@/lib/core";
import { useToast } from "@/components/hooks/use-toast";
import { DBAsset, DBAssetType } from "@/db";
import { aiConvert2Story, aiGenStory } from "@/lib/llm";
import { StoryScene } from "@/lib/core";
import { matchJSON } from "@/lib/utils";
import { Editor } from "@vnve/core";

interface UseStoryConversionConfig {
  editor: Editor;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export interface StoryState {
  story: StoryScene[];
  characterAssetMap: Record<string, DBAsset | null>;
  backgroundAssetMap: Record<string, DBAsset | null>;
  isProcessing: boolean;
  step: number;
  sceneTemplateName?: string;
  importInputText: string;
}

const initialState: StoryState = {
  story: [],
  characterAssetMap: {},
  backgroundAssetMap: {},
  isProcessing: false,
  step: 1,
  importInputText: "",
};

export function useStoryConversion(config: UseStoryConversionConfig) {
  const { editor, onSuccess, onError } = config;
  const [state, setState] = useState<StoryState>(initialState);

  const { toast } = useToast();
  const { selectAsset } = useAssetLibrary();

  const updateState = (updates: Partial<StoryState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  const setProcessing = (isProcessing: boolean) => {
    updateState({ isProcessing });
  };

  const handleError = (error: Error, customMessage?: string) => {
    toast({
      title: customMessage || "操作失败",
      description: error.message,
      variant: "destructive",
    });
    onError?.(error);
  };
  const handleStory = async (newStory: StoryScene[]): Promise<boolean> => {
    try {
      updateState({ story: newStory });

      const result = await parseStory(newStory);

      updateState({
        characterAssetMap: result.characterAssetMap,
        backgroundAssetMap: result.backgroundAssetMap,
        step: 2,
      });
      return true;
    } catch (error) {
      handleError(error instanceof Error ? error : new Error(String(error)));
      return false;
    }
  };

  const handleAIConvert = async (
    type: "convert" | "generate",
    input: string,
  ): Promise<boolean> => {
    setProcessing(true);
    try {
      const story = await (type === "convert"
        ? aiConvert2Story(input)
        : aiGenStory(input));
      const text = story2Text(story);
      updateState({ importInputText: text });
      return await handleStory(story);
    } catch (error) {
      handleError(
        error instanceof Error ? error : new Error(String(error)),
        `${type === "convert" ? "转换" : "生成"}失败`,
      );
      return false;
    } finally {
      setProcessing(false);
    }
  };

  const handleImportStory = async (text: string): Promise<boolean> => {
    setProcessing(true);
    try {
      const json = matchJSON(text); // 支持导入JSON格式
      const story = json?.scenes ? json.scenes : text2Story(text);
      return await handleStory(story);
    } catch (error) {
      handleError(
        error instanceof Error ? error : new Error(String(error)),
        "导入失败",
      );
      return false;
    } finally {
      setProcessing(false);
    }
  };

  const handleSelectCharacter = async (name: string): Promise<boolean> => {
    if (state.isProcessing) return false;
    const asset = await selectAsset(DBAssetType.Character);
    if (asset) {
      updateState({
        characterAssetMap: {
          ...state.characterAssetMap,
          [name]: asset,
        },
      });
      return true;
    }
    return false;
  };

  const handleSelectBackground = async (name: string): Promise<boolean> => {
    if (state.isProcessing) return false;
    const asset = await selectAsset(DBAssetType.Background);
    if (asset) {
      updateState({
        backgroundAssetMap: {
          ...state.backgroundAssetMap,
          [name]: asset,
        },
      });
      return true;
    }
    return false;
  };

  const handleNextStep = (): boolean => {
    if (!state.characterAssetMap) return false;

    const hasUnselected = Object.entries(state.characterAssetMap).some(
      ([, asset]) => !asset,
    );

    if (hasUnselected) {
      toast({
        title: "请为所有角色选择素材",
        variant: "destructive",
      });
      return false;
    }

    updateState({ step: state.step + 1 });
    return true;
  };

  const handleFinish = async (): Promise<boolean> => {
    if (!state.backgroundAssetMap) return false;

    const hasUnselected = Object.entries(state.backgroundAssetMap).some(
      ([, asset]) => !asset,
    );

    if (hasUnselected) {
      toast({
        title: "请为所有场景选择素材",
        variant: "destructive",
      });
      return false;
    }

    setProcessing(true);
    try {
      await story2Scenes(
        state.story,
        editor,
        state.characterAssetMap as Record<string, DBAsset>,
        state.backgroundAssetMap as Record<string, DBAsset>,
        state.sceneTemplateName,
      );
      onSuccess?.();
      return true;
    } catch (error) {
      handleError(
        error instanceof Error ? error : new Error(String(error)),
        "生成失败",
      );
      return false;
    } finally {
      setProcessing(false);
    }
  };

  const setSceneTemplate = (templateName: string) => {
    updateState({ sceneTemplateName: templateName });
  };

  const reset = () => {
    setState(initialState);
  };

  return {
    // 状态
    state,
    // 状态更新
    updateState,
    // AI 相关
    handleAIConvert,
    // 导入相关
    handleImportStory,
    // 素材选择
    handleSelectCharacter,
    handleSelectBackground,
    // 流程控制
    handleNextStep,
    handleFinish,
    setSceneTemplate,
    // 工具方法
    reset,
  };
}
