import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { downloadFile } from "@/lib/utils";
import { useEditorStore } from "@/store";

export function ExportVideoDialog({
  url,
  isOpen,
  onClose,
}: {
  url: string;
  isOpen: boolean;
  onClose: () => void;
}) {
  const project = useEditorStore((state) => state.project);
  const handleOpenChange = (value) => {
    if (!value) {
      onClose();
    }
  };

  const handleDownloadVideo = () => {
    downloadFile(project.name, url);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className="min-w-[80vw]"
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>导出</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        {url && (
          <video src={url} className="w-full aspect-[16/9]" controls></video>
        )}
        <DialogFooter>
          {url && <Button onClick={handleDownloadVideo}>下载</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
