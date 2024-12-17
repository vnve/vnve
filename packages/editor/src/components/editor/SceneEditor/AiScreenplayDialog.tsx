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

export function AiScreenplayDialog({
  isOpen,
  onClose,
  onConfirm,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (type: "transfer" | "generate") => void;
}) {
  const handleOpenChange = (value) => {
    if (!value) {
      onClose();
    }
  };

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
        <Tabs defaultValue="transfer">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="transfer">转换剧本</TabsTrigger>
            <TabsTrigger value="generate">生成剧本</TabsTrigger>
          </TabsList>
          <TabsContent value="transfer">
            <div className="space-y-2">
              <Textarea
                placeholder="请在此处输入您的小说、故事内容"
                rows={12}
              />
              <div className="flex justify-center">
                <Button onClick={() => onConfirm("transfer")}>
                  <Icons.wandSparkles className="size-4 mr-1" />
                  一键转换
                </Button>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="generate">
            <div className="space-y-2">
              <Textarea placeholder="请输入您的故事剧情大纲" rows={12} />
              <div className="flex justify-center">
                <Button onClick={() => onConfirm("generate")}>
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
