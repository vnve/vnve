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
import { Progress } from "@/components/ui/progress";
import { ActionProgress } from "./types";
import { downloadSRT, genSRT } from "@/lib/srt";
import { cn } from "@/lib/utils";

export function ExportVideoDialog({
  progress,
  url,
  subtitles,
  isOpen,
  onClose,
  aspectRatio,
}: {
  progress: ActionProgress;
  url: string;
  subtitles: Subtitle[];
  isOpen: boolean;
  onClose: () => void;
  aspectRatio: number; // width / height
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

  const handleDownloadSubtitles = () => {
    const srt = genSRT(subtitles);
    downloadSRT(srt, project.name);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn(aspectRatio > 1 ? "w-[80vw]" : "h-[90vh]")}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>导出</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        {!url && <Progress value={progress.value} />}
        {url && (
          <div className="flex-1 flex justify-center">
            <video
              src={url}
              className={aspectRatio > 1 ? "w-full" : "h-[calc(90vh-140px)]"}
              style={{ aspectRatio }}
              controls
            ></video>
          </div>
        )}
        <DialogFooter>
          {url && (
            <Button onClick={handleDownloadVideo}>
              <Icons.download className="size-4 mr-1"></Icons.download>
              保存视频
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
