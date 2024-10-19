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

export const PreviewVideoDialog = forwardRef(
  (
    {
      isOpen,
      onClose,
      onExport,
    }: { isOpen: boolean; onClose: () => void; onExport: () => void },
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
          </DialogHeader>

          <DialogFooter>
            <Button onClick={onExport}>立即导出</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  },
);
