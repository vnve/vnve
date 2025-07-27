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
import { forwardRef, useImperativeHandle, useRef } from "react";
import { Progress } from "@/components/ui/progress";
import { ActionProgress } from "./types";
import { cn } from "@/lib/utils";

export const PreviewVideoDialog = forwardRef(
  (
    {
      progress,
      isOpen,
      onReplay,
      onClose,
      onExport,
      aspectRatio,
    }: {
      progress: ActionProgress;
      isOpen: boolean;
      onReplay: () => void;
      onClose: () => void;
      onExport: () => void;
      aspectRatio: number; // width / height
    },
    ref,
  ) => {
    const previewCanvasRef = useRef(null);

    useImperativeHandle(ref, () => ({
      getPreviewCanvas: () => previewCanvasRef.current,
    }));

    const handleOpenChange = (value) => {
      if (!value) {
        onClose();
      }
    };

    return (
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent
          className={cn(aspectRatio > 1 ? "w-[80vw]" : "h-[90vh]")}
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>预览</DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>

          <div className="flex-1 flex flex-col items-center">
            <canvas
              ref={previewCanvasRef}
              className={aspectRatio > 1 ? "w-full" : "h-[calc(90vh-160px)]"}
              style={{ aspectRatio }}
            ></canvas>
            <Progress value={progress.value} className="mt-2" />
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={onReplay}>
              <Icons.refresh className="size-5" />
            </Button>
            <Button onClick={onExport}>
              <Icons.download className="size-4 mr-1" />
              导出视频
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  },
);
