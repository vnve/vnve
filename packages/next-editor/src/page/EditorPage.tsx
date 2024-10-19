import { SceneList } from "@/components/editor/SceneList";
import { ChildEditor, SceneEditor } from "@/components/editor/SceneEditor";
import { SceneDetail } from "@/components/editor/SceneDetail";
import { AssetLibrary } from "@/components/editor/AssetLibrary";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/hooks/use-toast";

export function EditorPage() {
  const { toast } = useToast();

  return (
    <div className="grid h-screen w-full">
      <div className="flex flex-col">
        <header className="sticky top-0 z-10 flex h-[53px] items-center gap-1 border-b bg-background px-4">
          <h1 className="text-xl font-semibold">Playground</h1>
          <Button
            variant="outline"
            size="sm"
            className="ml-auto gap-1.5 text-sm"
            onClick={() => {
              toast({
                title: "Scheduled: Catch up",
                description: "Friday, February 10, 2023 at 5:57 PM",
              });
            }}
          ></Button>
        </header>
        <main className="grid flex-1 gap-2 overflow-auto p-2 md:grid-cols-2 lg:grid-cols-3 bg-muted/50">
          <div className="relative hidden md:flex h-[calc(100vh-53px-1rem)]">
            <SceneDetail />
          </div>
          <div className="relative flex h-full flex-col lg:col-span-2 gap-2">
            <SceneEditor />
            <div className="flex gap-2 h-[50vh] md:h-[30vh] flex-col sm:flex-row">
              <ChildEditor />
              <SceneList />
            </div>
          </div>
        </main>
      </div>
      <AssetLibrary />
      <Toaster />
    </div>
  );
}
