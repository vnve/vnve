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
import { Textarea } from "@/components/ui/textarea";
import { useEditorStore } from "@/store";
import { DBAssetType } from "@/db";
import { Loader2, Send, Settings } from "lucide-react";
import { AssetStateCard } from "@/components/editor/AssetLibrary/AssetCard";
import { useStoryConversion } from "@/components/hooks/useStoryConversion";
import { Icons } from "@/components/icons";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { EditorSettingsDialog } from "@/components/editor/SceneEditor/EditorSettingsDialog";
import { Toaster } from "@/components/ui/toaster";

export function HomePage() {
  const [storyInput, setStoryInput] = useState("");
  const [loadingText, setLoadingText] = useState("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
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
      <div className="min-h-screen bg-background">
        {/* 顶部导航栏 */}
        <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-14 items-center justify-between px-4">
            {/* 左侧 Logo */}
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold">V N V E</h1>
            </div>

            {/* 右侧按钮组 */}
            <div className="flex items-center space-x-2">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSettingsOpen(true)}
              >
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <a
                  href="https://github.com/vnve/vnve"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1"
                >
                  <Icons.gitHub className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </header>

        {/* 主内容区域 */}
        <main className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="w-full max-w-4xl space-y-8">
            {/* 标题和描述 */}
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-bold tracking-tight">
                开始创作你的视觉小说视频
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                在这里输入你的故事，我们将把故事智能换成视觉小说剧本
              </p>
            </div>

            {/* 输入区域 */}
            <div className="w-full max-w-3xl mx-auto">
              <div className="relative">
                <Textarea
                  value={storyInput}
                  onChange={(e) => setStoryInput(e.target.value)}
                  placeholder="在这里输入你的故事情节...&#10;&#10;例如：&#10;在一个阳光明媚的午后，小明走进了学校的图书馆。&#10;他看到了坐在窗边看书的小红。&#10;小明：你好，我可以坐在这里吗？&#10;小红：当然可以。&#10;..."
                  className="min-h-[300px] resize-none pr-12 text-base leading-relaxed"
                  disabled={!!loadingText}
                />
                <Button
                  onClick={() => handleGenerate(storyInput)}
                  disabled={!storyInput.trim() || !!loadingText}
                  className="absolute bottom-3 right-3"
                  size="sm"
                >
                  {loadingText ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      {loadingText}
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      一键生成
                    </>
                  )}
                </Button>
              </div>

              {/* 提示文本 */}
              <div className="mt-4 text-center text-sm text-muted-foreground">
                或者你也可以直接从
                <Button
                  variant="link"
                  className="h-auto p-1 text-sm"
                  onClick={() => navigate("/editor")}
                >
                  编辑器
                </Button>
                开始创作
              </div>
            </div>
          </div>
        </main>
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

      {/* Settings Dialog */}
      <EditorSettingsDialog
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
      <Toaster />
    </>
  );
}
