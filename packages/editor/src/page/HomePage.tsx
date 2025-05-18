import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useEditorStore } from "@/store";
import { DBAssetType } from "@/db";
import { Loader2 } from "lucide-react";
import { AssetStateCard } from "@/components/editor/AssetLibrary/AssetCard";
import { useStoryConversion } from "@/components/hooks/useStoryConversion";
import { TextFileEditor } from "@/components/ui/text-file-editor";

export function HomePage() {
  const [storyInput, setStoryInput] = useState("");
  const [loadingText, setLoadingText] = useState("");
  const navigate = useNavigate();
  const editor = useEditorStore((state) => state.editor);

  const conversion = useStoryConversion({
    editor,
    onSuccess: () => {
      navigate("/editor");
      // 重置状态
      setStoryInput("");
      setLoadingText("");
      reset();
    },
    onError: () => setLoadingText(""),
  });

  const {
    state,
    handleAIConvert,
    handleSelectCharacter,
    handleSelectBackground,
    handleNextStep,
    handleFinish,
    reset,
  } = conversion;
  const { isProcessing, step, characterAssetMap, backgroundAssetMap } = state;
  const handleGenerate = async (text: string) => {
    if (!text.trim()) return;

    setLoadingText("智能转换中");
    await handleAIConvert("convert", text);
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex flex-col items-center justify-center p-4">
        <div className="max-w-4xl w-full space-y-12 text-center">
          <div className="space-y-4 max-w-2xl mx-auto p-4 bg-gray-800/50 rounded-lg">
            <TextFileEditor
              value={storyInput}
              onChange={setStoryInput}
              placeholder="在这里输入你的故事..."
              loading={loadingText}
              onComplete={handleGenerate}
            />
          </div>
        </div>
      </div>

      {/* Character Selection Dialog */}
      <Dialog open={step === 2} onOpenChange={() => null}>
        <DialogContent className="min-w-[70vw]">
          <DialogHeader>
            <DialogTitle>选择角色</DialogTitle>
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
                      asset.states.find(
                        (state) => state.id === asset.stateId,
                      ) || asset.states[0];
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
          <div className="flex justify-end">
            <Button onClick={handleNextStep}>下一步</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Background Selection Dialog */}
      <Dialog open={step === 3} onOpenChange={() => null}>
        <DialogContent className="min-w-[70vw]">
          <DialogHeader>
            <DialogTitle>选择场景</DialogTitle>
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
                      asset.states.find(
                        (state) => state.id === asset.stateId,
                      ) || asset.states[0];
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
          <div className="flex justify-end">
            <Button onClick={handleFinish} disabled={isProcessing}>
              {isProcessing && (
                <Loader2 className="animate-spin mr-2 h-4 w-4" />
              )}
              完成
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
