import { DBAsset, DBAssetType } from "@/db";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

export const useAssetStore = create<{
  isOpen: boolean;
  type: DBAssetType | null;
  disableSelect: boolean;
  confirm: (asset?: DBAsset) => void | null;
  cancel: () => void | null;
  setConfirm: (confirm: (asset?: DBAsset) => void) => void;
  setCancel: (cancel: () => void) => void;
  setOpen: (open: boolean) => void;
  setType: (type: DBAssetType) => void;
  setDisableSelect: (disableSelect: boolean) => void;
}>()(
  immer((set) => {
    return {
      isOpen: false,
      type: null,
      disableSelect: false,
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
      setDisableSelect(disableSelect: boolean) {
        set((state) => {
          state.disableSelect = disableSelect;
        });
      },
    };
  }),
);
