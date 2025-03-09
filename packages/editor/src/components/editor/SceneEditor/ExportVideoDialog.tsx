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

export function ExportVideoDialog({
  progress,
  url,
  subtitles,
  isOpen,
  onClose,
}: {
  progress: ActionProgress;
  url: string;
  subtitles: Subtitle[];
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

  const handleDownloadSubtitles = () => {
    const srt = genSRT(subtitles);
    downloadSRT(srt, project.name);
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
        {!url && <Progress value={progress.value} />}
        {url && (
          <video src={url} className="w-full aspect-[16/9]" controls></video>
        )}
        <DialogFooter>
          {/* {url && subtitles.length > 0 && (
            <Button variant="secondary" onClick={handleDownloadSubtitles}>
              <Icons.download className="size-4 mr-1"></Icons.download>
              保存字幕
            </Button>
          )} */}
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
