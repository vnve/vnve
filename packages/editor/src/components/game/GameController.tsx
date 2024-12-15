import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function GameController() {
  return (
    <Card className="rounded-md relative">
      <CardContent className="relative h-full p-2">
        <div className="flex w-full items-center space-x-2">
          <Input className="flex-1" placeholder="请输入下一步操作" />
          <Button>发送</Button>
        </div>
      </CardContent>
    </Card>
  );
}
