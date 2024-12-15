import { SceneList } from "@/components/editor/SceneList";
import {
  ChildEditor,
  EditorHeader,
  SceneEditor,
} from "@/components/editor/SceneEditor";
import { SceneDetail } from "@/components/editor/SceneDetail";
import { AssetLibrary } from "@/components/editor/AssetLibrary";
import { useState } from "react";
import { useMedia } from "@/components/hooks/useMedia";

export function EditorPage() {
  const [isOpenSceneDetailDialog, setIsOpenSceneDetailDialog] = useState(false);
  const isMd = useMedia("(min-width: 768px)");

  const handleOpenSceneDetailDialog = () => {
    setIsOpenSceneDetailDialog(true);
  };

  return (
    <>
      <div className="h-screen flex flex-col">
        <EditorHeader />
        <main className="grid flex-1 gap-2 overflow-auto p-2 grid-cols-1 md:grid-cols-[minmax(450px,1fr)_2fr] bg-muted/50">
          <div className="relative hidden md:flex h-[calc(100vh-53px-1rem)]">
            {isMd && <SceneDetail />}
          </div>
          <div className="relative flex h-full flex-col gap-2">
            <SceneEditor />
            <div className="flex gap-2 h-[50vh] md:h-[30vh] flex-col sm:flex-row">
              <ChildEditor />
              <SceneList
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
    </>
  );
}
