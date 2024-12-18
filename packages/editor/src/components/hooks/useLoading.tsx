import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Loader } from "@/components/ui/loader";
import { useState } from "react";

export function useLoading() {
  const [isOpen, setIsOpen] = useState(false);
  const [loadingText, setLoadingText] = useState("");

  const showLoading = (text: string) => {
    setIsOpen(true);
    setLoadingText(text);
  };
  const hideLoading = () => {
    setIsOpen(false);
    setLoadingText("");
  };
  const handleOpenChange = () => {};
  const Loading = () => (
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
          <div className="font-bold text-xl">{loadingText}</div>
          <Loader></Loader>
        </div>
      </DialogContent>
    </Dialog>
  );

  return {
    Loading,
    showLoading,
    hideLoading,
  };
}
