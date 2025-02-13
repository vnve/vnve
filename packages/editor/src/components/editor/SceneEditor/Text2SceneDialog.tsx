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
import { useEffect, useState } from "react";
import {
  StoryScene,
  parseStory,
  story2Scenes,
  story2Text,
  text2Story,
} from "@/lib/core";
import { useEditorStore } from "@/store";
import { aiConvert2Story, aiGenStory } from "@/lib/llm";
import { useToast } from "@/components/hooks/use-toast";
import { TextFileEditor } from "@/components//ui/text-file-editor";
import { useAssetLibrary } from "@/components/hooks/useAssetLibrary";
import { AssetStateCard } from "@/components/editor/AssetLibrary/AssetCard";
import { DBAssetType } from "@/db";
import { Loader2 } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { matchJSON } from "@/lib/utils";

export function Text2SceneDialog({
  isOpen,
  type,
  onClose,
}: {
  isOpen: boolean;
  type: "formatter" | "ai";
  onClose: () => void;
}) {
  const editor = useEditorStore((state) => state.editor);
  const [story, setStory] = useState([]);
  const [loadingText, setLoadingText] = useState("");
  const { toast } = useToast();
  const [characterAssetMap, setCharacterAssetMap] = useState(null);
  const [backgroundAssetMap, setBackgroundAssetMap] = useState(null);
  const [aiInputText, setAiInputText] = useState("");
  const [importInputText, setImportInputText] = useState("");
  const [step, setStep] = useState(1);
  const { selectAsset } = useAssetLibrary();

  useEffect(() => {
    if (type === "ai") {
      setStep(1);
    }

    if (type === "formatter") {
      setStep(2);
    }
  }, [type]);

  const handleClose = () => {
    onClose();
    setStory([]);
    setLoadingText("");
    setCharacterAssetMap(null);
    setBackgroundAssetMap(null);
    setAiInputText("");
    setImportInputText("");
  };

  const handleImportScreenplay = async (text: string) => {
    setLoadingText("剧本导入中");
    try {
      const json = matchJSON(text); // 同步支持导入JSON格式

      await handleStory(json?.scenes ? json.scenes : text2Story(text));
    } catch (error) {
      toast({
        title: "导入失败！",
        description: error.message,
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setLoadingText("");
    }
  };

  const handleAiScreenplay = async (
    type: "convert" | "generate",
    input: string,
  ) => {
    setLoadingText(type === "convert" ? "智能转换中" : "智能生成中");
    try {
      let story;

      if (type === "convert") {
        story = await aiConvert2Story(input);
      } else {
        story = await aiGenStory(input);
      }

      const text = story2Text(story);

      setImportInputText(text);
      setStep(step + 1);
    } catch (error) {
      toast({
        title: `${type === "convert" ? "转换" : "生成"}失败！`,
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoadingText("");
    }
  };

  const handleStory = async (story: StoryScene[]) => {
    setStory(story);
    const result = await parseStory(story);

    setCharacterAssetMap(result.characterAssetMap);
    setBackgroundAssetMap(result.backgroundAssetMap);

    setStep(step + 1);
  };

  const handleDoNextStep = () => {
    const hasUnselected = Object.keys(characterAssetMap).some(
      (name) => !characterAssetMap[name],
    );

    if (hasUnselected) {
      toast({
        title: "请为所有角色选择素材",
        variant: "destructive",
      });
      return;
    }

    setStep(step + 1);
  };

  const handleStory2Scenes = async () => {
    const hasUnselected = Object.keys(backgroundAssetMap).some(
      (name) => !backgroundAssetMap[name],
    );

    if (hasUnselected) {
      toast({
        title: "请为所有场景选择素材",
        variant: "destructive",
      });
      return;
    }

    setLoadingText("场景生成中");
    try {
      await story2Scenes(story, editor, characterAssetMap, backgroundAssetMap);
      handleClose();
    } catch (error) {
      toast({
        title: "生成失败！",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoadingText("");
    }
  };

  const handleSelectCharacter = async (name: string) => {
    const asset = await selectAsset(DBAssetType.Character);

    if (asset) {
      setCharacterAssetMap({
        ...characterAssetMap,
        [name]: asset,
      });
    }
  };

  const handleSelectBackground = async (name: string) => {
    if (loadingText) {
      return;
    }

    const asset = await selectAsset(DBAssetType.Background);

    if (asset) {
      setBackgroundAssetMap({
        ...backgroundAssetMap,
        [name]: asset,
      });
    }
  };

  // AI
  const Step1 = () => {
    return (
      <>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icons.sparkles className="size-5" />
            智能剧本
          </DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="convert">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="convert">转换剧本</TabsTrigger>
            <TabsTrigger value="generate">生成剧本</TabsTrigger>
          </TabsList>
          <TabsContent value="convert">
            <TextFileEditor
              value={aiInputText}
              onChange={setAiInputText}
              placeholder="请输入小说、故事原文"
              loading={loadingText}
              onComplete={(text) => handleAiScreenplay("convert", text)}
            ></TextFileEditor>
          </TabsContent>
          <TabsContent value="generate">
            <TextFileEditor
              value={aiInputText}
              onChange={setAiInputText}
              placeholder="请输入剧情大纲"
              loading={loadingText}
              onComplete={(text) => handleAiScreenplay("generate", text)}
            ></TextFileEditor>
          </TabsContent>
        </Tabs>
      </>
    );
  };

  // 剧本展示
  const Step2 = () => {
    return (
      <>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            导入剧本
          </DialogTitle>
          <DialogDescription></DialogDescription>
          <TextFileEditor
            value={importInputText}
            placeholder="请输入或者选择剧本文件"
            loading={loadingText}
            onChange={setImportInputText}
            onComplete={handleImportScreenplay}
          >
            {type === "ai" && (
              <Button variant="outline" onClick={() => setStep(step - 1)}>
                返回
              </Button>
            )}
          </TextFileEditor>
        </DialogHeader>
      </>
    );
  };

  // 选择人物
  const Step3 = () => {
    return (
      <>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            选择角色
          </DialogTitle>
          <DialogDescription>
            根据剧本解析出以下角色，请选择角色对应的素材
          </DialogDescription>
        </DialogHeader>
        <ScrollArea>
          <div className="flex gap-1 pb-4">
            {Object.keys(characterAssetMap).map((name) => {
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
                ></AssetStateCard>
              );
            })}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setStep(step - 1)}>
            返回
          </Button>

          <Button onClick={handleDoNextStep}>下一步</Button>
        </div>
      </>
    );
  };

  // 选择场景
  const Step4 = () => {
    return (
      <>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            选择场景
          </DialogTitle>
          <DialogDescription>
            根据剧本解析出以下场景，请选择场景对应的素材
          </DialogDescription>
        </DialogHeader>
        <ScrollArea>
          <div className="flex gap-1 pb-4">
            {Object.keys(backgroundAssetMap).map((name) => {
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
                ></AssetStateCard>
              );
            })}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
        <div className="flex justify-between">
          <Button
            variant="outline"
            disabled={!!loadingText}
            onClick={() => setStep(step - 1)}
          >
            返回
          </Button>
          <Button disabled={!!loadingText} onClick={handleStory2Scenes}>
            {loadingText && <Loader2 className="animate-spin mr-1" />}
            {loadingText ? loadingText : "生成"}
          </Button>
        </div>
      </>
    );
  };

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
