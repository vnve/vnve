import { ChildList } from "./ChildList";
import { ChildStyle } from "./ChildStyle";
import { ChildPosition } from "./ChildPosition";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function ChildEditor() {
  return (
    <Card className="flex-1 shrink-0 max-h-[50%] sm:max-h-full rounded-md">
      <CardContent className="h-full p-2">
        <Tabs defaultValue="position" className="h-full flex flex-col">
          <TabsList className="self-center">
            <TabsTrigger value="position">位置</TabsTrigger>
            <TabsTrigger value="style">样式</TabsTrigger>
            <TabsTrigger value="list">列表</TabsTrigger>
          </TabsList>
          <TabsContent className="h-[calc(100%-2.5rem)]" value="position">
            <ChildPosition />
          </TabsContent>
          <TabsContent className="h-[calc(100%-2.5rem)]" value="style">
            <ChildStyle />
          </TabsContent>
          <TabsContent className="h-[calc(100%-2.5rem)]" value="list">
            <ChildList />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
