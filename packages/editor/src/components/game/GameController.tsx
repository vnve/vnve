import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useGameStore } from "@/store";
import { useState } from "react";

export function GameController() {
  const game = useGameStore((state) => state.game);
  const [nextAction, setNextAction] = useState("");

  const handleSend = () => {
    game.play(nextAction);
  };

  return (
    <Card className="rounded-md relative">
      <CardContent className="relative h-full p-2">
        <div className="flex w-full items-center space-x-2">
          <Input
            className="flex-1"
            placeholder="请输入下一步操作"
            value={nextAction}
            onChange={(e) => setNextAction(e.target.value)}
          />
          <Button onClick={handleSend}>发送</Button>
        </div>
      </CardContent>
    </Card>
  );
}
