import { ChildList } from "./ChildList";
import { ChildStyle } from "./ChildStyle";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

export function ChildEditor() {
  return (
    <Card className="flex-1 h-full rounded-md">
      <CardContent className="h-full p-2">
        <ScrollArea className="h-full">
          <ChildList />
          <ChildStyle />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
