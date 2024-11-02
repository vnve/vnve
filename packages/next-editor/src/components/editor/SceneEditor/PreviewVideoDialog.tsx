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

export const PreviewVideoDialog = forwardRef(
  (
    {
      progress,
      isOpen,
      onReplay,
      onClose,
      onExport,
    }: {
      progress: ActionProgress;
      isOpen: boolean;
      onReplay: () => void;
      onClose: () => void;
      onExport: () => void;
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
          className="min-w-[80vw]"
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>预览</DialogTitle>
            <DialogDescription></DialogDescription>
            <canvas
              ref={previewCanvasRef}
              className="w-full aspect-[16/9]"
            ></canvas>
            <Progress value={progress.value} className="mt-2" />
          </DialogHeader>

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
