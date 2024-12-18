import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

export const useLoadingStore = create<{
  isOpen: boolean;
  loadingText: string;
  setOpen: (open: boolean) => void;
  setLoadingText: (text: string) => void;
}>()(
  immer((set) => {
    return {
      isOpen: false,
      loadingText: "",
      setOpen(open: boolean) {
        set((state) => {
          state.isOpen = open;
        });
      },
      setLoadingText(text: string) {
        set((state) => {
          state.loadingText = text;
        });
      },
    };
  }),
);
