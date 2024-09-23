import { DBAsset, DBAssetType } from "@/db";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

export const useAssetStore = create<{
  isOpen: boolean;
  type: DBAssetType | null;
  confirm: (asset?: DBAsset) => void | null;
  cancel: () => void | null;
  setConfirm: (confirm: (asset?: DBAsset) => void) => void;
  setCancel: (cancel: () => void) => void;
  setOpen: (open: boolean) => void;
  setType: (type: DBAssetType) => void;
}>()(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  immer<any>((set) => {
    return {
      isOpen: false,
      type: null,
      confirm: null,
      cancel: null,
      setConfirm(confirm: (asset?: DBAsset) => void) {
        set((state) => {
          state.confirm = confirm;
        });
      },
      setCancel(cancel: () => void) {
        set((state) => {
          state.cancel = cancel;
        });
      },
      setOpen(open: boolean) {
        set((state) => {
          state.isOpen = open;
        });
      },
      setType(type: DBAssetType) {
        set((state) => {
          state.type = type;
        });
      },
    };
  }),
);
