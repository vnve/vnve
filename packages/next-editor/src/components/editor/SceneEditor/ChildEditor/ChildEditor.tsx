import { ChildList } from "./ChildList";
import { ChildStyle } from "./ChildStyle";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function ChildEditor() {
  return (
    <Card className="flex-1 max-h-[50%] sm:max-h-full rounded-md">
      <CardContent className="h-full p-2">
        <Tabs defaultValue="style" className="h-full flex flex-col">
          <TabsList className="self-center">
            <TabsTrigger value="style">素材样式</TabsTrigger>
            <TabsTrigger value="list">素材列表</TabsTrigger>
          </TabsList>
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
