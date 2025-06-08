import { SceneList } from "@/components/editor/SceneList";
import {
  ChildEditor,
  EditorHeader,
  SceneEditor,
} from "@/components/editor/SceneEditor";
import { SceneDetail } from "@/components/editor/SceneDetail";
import { AssetLibrary } from "@/components/editor/AssetLibrary";
import { Toaster } from "@/components/ui/toaster";
import { useEffect, useMemo, useState } from "react";
import { useToast } from "@/components/hooks/use-toast";
import { useMedia } from "@/components/hooks/useMedia";
import { checkEnv } from "@vnve/core";
import { setDisableAudio } from "@/lib/core";
import { Loading } from "@/components/editor/Loading";
import { useSettingsStore } from "@/store/settings";
import { cn } from "@/lib/utils";

export function EditorPage() {
  const [isOpenSceneDetailDialog, setIsOpenSceneDetailDialog] = useState(false);
  const isMd = useMedia("(min-width: 768px)");
  const [isSupported, setIsSupported] = useState(null);
  const { toast } = useToast();
  const canvasSetting = useSettingsStore((state) => state.canvas);

  const isPortraitCanvas = useMemo(() => {
    return (
      canvasSetting.width < canvasSetting.height ||
      (canvasSetting.width === canvasSetting.height && isMd)
    );
  }, [canvasSetting, isMd]);

  const handleOpenSceneDetailDialog = () => {
    setIsOpenSceneDetailDialog(true);
  };

  useEffect(() => {
    checkEnv().then((env) => {
      setIsSupported(env.video);

      if (!env.audio) {
        setDisableAudio(true);
        toast({
          title: "提示",
          description:
            "当前浏览器不支持音频合成，请使用最新桌面版的Chrome或Edge浏览器获取完整体验～",
          duration: 1500,
        });
      }
    });
  }, [toast]);

  if (!isSupported) {
    return (
      <div className="flex h-screen items-center justify-center">
        {isSupported === false ? (
          <div className="text-center">
            <h1 className="text-2xl font-semibold">您的浏览器不支持</h1>
            <p className="text-sm">请使用最新桌面版的Chrome或Edge浏览器～</p>
          </div>
        ) : (
          <div className="text-center">环境检测中...</div>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="h-screen flex flex-col">
        <EditorHeader />
        <main className="grid flex-1 gap-2 overflow-auto p-2 grid-cols-1 md:grid-cols-[minmax(450px,1fr)_2fr] bg-muted/50">
          <div className="relative hidden md:flex h-[calc(100vh-53px-1rem)]">
            {isMd && <SceneDetail />}
          </div>
          <div
            className={cn(
              "relative flex h-full flex-col gap-2",
              isPortraitCanvas && "flex-row",
            )}
          >
            <SceneEditor />
            <div
              className={cn(
                "flex gap-2 h-[50vh] md:h-[30vh] flex-col sm:flex-row",
                isPortraitCanvas && "h-full md:h-full sm:flex-col flex-1",
              )}
            >
              <ChildEditor isPortraitCanvas={isPortraitCanvas} />
              <SceneList
                isPortraitCanvas={isPortraitCanvas}
                onOpenSceneDetailDialog={handleOpenSceneDetailDialog}
              />
            </div>
          </div>
        </main>
      </div>
      {!isMd && isOpenSceneDetailDialog && (
        <div className="fixed top-0 left-0 size-full z-50">
          <SceneDetail onClose={() => setIsOpenSceneDetailDialog(false)} />
        </div>
      )}
      <AssetLibrary />
      <Toaster />
      <Loading />
    </>
  );
}
