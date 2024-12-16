import { EditorHeader } from "@/components/editor/SceneEditor";
import { GameController } from "@/components/game/GameController";
import { GamePlayer } from "@/components/game/GamePlayer";
import { GameSetting } from "@/components/game/GameSetting";

export function GamePage() {
  return (
    <div className="h-screen flex flex-col">
      <EditorHeader />
      <main className="grid flex-1 gap-2 overflow-auto p-2 grid-cols-[2fr_1fr] bg-muted/50">
        <div className="relative flex flex-col gap-2">
          <GamePlayer />
          <GameController />
        </div>
        <div className="relative flex flex-col gap-2">
          <GameSetting />
        </div>
      </main>
    </div>
  );
}
