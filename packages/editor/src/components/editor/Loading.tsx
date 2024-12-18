import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Loader } from "@/components/ui/loader";
import { useLoadingStore } from "@/store";

export function Loading() {
  const isOpen = useLoadingStore((state) => state.isOpen);
  const loadingText = useLoadingStore((state) => state.loadingText);

  return (
    <Dialog open={isOpen}>
      <DialogContent
        disableClose={true}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="hidden">
          <DialogTitle></DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <div className="w-full flex gap-2 justify-center items-center">
          <div className="font-bold text-xl">{loadingText}</div>
          <Loader></Loader>
        </div>
      </DialogContent>
    </Dialog>
  );
}
