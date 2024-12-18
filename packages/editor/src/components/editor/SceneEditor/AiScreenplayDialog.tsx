import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";

export function AiScreenplayDialog({
  isOpen,
  onClose,
  onConfirm,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (type: "convert" | "generate", input: string) => void;
}) {
  const handleOpenChange = (value) => {
    if (!value) {
      onClose();
    }
  };
  const [inputText, setInputText] = useState("");

  useEffect(() => {
    if (isOpen) {
      setInputText("");
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className="min-w-[60vw]"
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icons.sparkles className="size-5" />
            智能剧本
          </DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="convert" onValueChange={() => setInputText("")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="convert">转换剧本</TabsTrigger>
            <TabsTrigger value="generate">生成剧本</TabsTrigger>
          </TabsList>
          <TabsContent value="convert">
            <div className="space-y-2">
              <Textarea
                placeholder="请在此处输入您的小说、故事内容"
                rows={12}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              <div className="flex justify-center">
                <Button onClick={() => onConfirm("convert", inputText)}>
                  <Icons.wandSparkles className="size-4 mr-1" />
                  一键转换
                </Button>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="generate">
            <div className="space-y-2">
              <Textarea
                placeholder="请输入您的故事剧情大纲"
                rows={12}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              <div className="flex justify-center">
                <Button onClick={() => onConfirm("generate", inputText)}>
                  <Icons.wandSparkles className="size-4 mr-1" />
                  一键生成
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
