import { DBAsset, DBAssetType } from "@/db";
import { useAssetStore } from "@/store";

export function useAssetLibrary() {
  const setConfirm = useAssetStore((state) => state.setConfirm);
  const setCancel = useAssetStore((state) => state.setCancel);
  const setOpen = useAssetStore((state) => state.setOpen);
  const setType = useAssetStore((state) => state.setType);
  const setDisableSelect = useAssetStore((state) => state.setDisableSelect);
  const selectAsset: (
    type?: DBAssetType,
    disableSelect?: boolean,
  ) => Promise<DBAsset | undefined> = (
    type?: DBAssetType,
    disableSelect?: boolean,
  ) =>
    new Promise((resolve) => {
      setConfirm((asset: DBAsset) => {
        resolve(asset);
        setOpen(false);
      });

      setCancel(() => {
        resolve(undefined);
        setOpen(false);
      });

      setOpen(true);
      setType(type);
      setDisableSelect(disableSelect);
    });

  return {
    selectAsset,
  };
}
