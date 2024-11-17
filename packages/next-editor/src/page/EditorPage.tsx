import { SceneList } from "@/components/editor/SceneList";
import { ChildEditor, SceneEditor } from "@/components/editor/SceneEditor";
import { SceneDetail } from "@/components/editor/SceneDetail";
import { AssetLibrary } from "@/components/editor/AssetLibrary";
import { Toaster } from "@/components/ui/toaster";
import { Icons } from "@/components/icons";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
        <header className="sticky top-0 z-10 flex h-[53px] items-center gap-1 border-b bg-background px-4">
          <h1 className="text-xl font-semibold">V N V E</h1>
          <Icons.gitHub
            className="ml-auto size-5 cursor-pointer"
            onClick={() => {
              window.location.href = "https://github.com/vnve/vnve";
            }}
          ></Icons.gitHub>
        </header>
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
      {!isMd && (
        <Dialog
          open={isOpenSceneDetailDialog}
          onOpenChange={(value) => setIsOpenSceneDetailDialog(value)}
        >
          <DialogContent className="size-full p-0 flex flex-col">
            <DialogHeader className="mb-2">
              <DialogTitle></DialogTitle>
              <DialogDescription></DialogDescription>
            </DialogHeader>
            <div className="h-[calc(100vh-2rem)]">
              <SceneDetail />
            </div>
          </DialogContent>
        </Dialog>
      )}
      <AssetLibrary />
      <Toaster />
    </>
  );
}
