import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Loader } from "@/components/ui/loader";

export function ImportAssetLoadingDialog({ isOpen }: { isOpen: boolean }) {
  const handleOpenChange = () => {};

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        disableClose={true}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="hidden">
          <DialogTitle></DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <div className="w-full flex gap-2 justify-center items-center">
          <div className="font-bold text-xl">导入中</div>
          <Loader></Loader>
        </div>
      </DialogContent>
    </Dialog>
  );
}
