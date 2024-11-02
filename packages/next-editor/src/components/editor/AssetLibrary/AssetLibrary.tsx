import { useEffect, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Button } from "@/components/ui/button";
import {
  assetDB,
  assetSourceDB,
  DBAsset,
  DBAssetType,
  DBAssetTypeOptions,
  DBAssetState,
} from "@/db";
import { useAssetStore } from "@/store";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AssetForm } from "./AssetForm";
import { AssetStateList } from "./AssetStateList";
import { Icons } from "@/components/icons";
import { AssetCard } from "./AssetCard";
import { getFileInfo } from "@/lib/utils";

export type DBAssetForm = DBAsset & {
  states: (DBAssetState & { file?: File })[];
};

export function AssetLibrary() {
  const isOpen = useAssetStore((state) => state.isOpen);
  const confirm = useAssetStore((state) => state.confirm);
  const cancel = useAssetStore((state) => state.cancel);
  const disableSelect = useAssetStore((state) => state.disableSelect);
  const defaultType = useAssetStore((state) => state.type);
  const [assetType, setAssetType] = useState(defaultType);
  const [editingAsset, setEditingAsset] = useState<DBAsset | null>(null);
  const [selectingAsset, setSelectingAsset] = useState<DBAsset | null>(null);
  const assets = useLiveQuery(
    () =>
      assetType
        ? assetDB.where("type").equals(assetType).reverse().toArray()
        : [],
    [assetType],
  );

  const handleChangeAssetType = (type: DBAssetType) => {
    setAssetType(type);
  };

  const handleAddAsset = () => {
    setEditingAsset({
      name: "",
      type: assetType,
      states: [],
    });
  };

  const handleEditAsset = (asset: DBAsset) => {
    setEditingAsset(asset);
  };

  const handleDeleteAsset = (asset: DBAsset) => {
    asset.states.forEach((state) => {
      assetSourceDB.delete(state.id);
    });

    assetDB.delete(asset.id);
  };

  const handleClose = () => {
    cancel();
    setEditingAsset(null);
    setSelectingAsset(null);
  };

  const addAssetToDB = async (asset: DBAssetForm) => {
    for (const state of asset.states) {
      const ext = getFileInfo(state.file).ext;
      const id = await assetSourceDB.add({
        mime: state.file.type,
        blob: state.file,
        ext,
      });

      state.id = id;
      state.ext = ext;

      delete state.file;
    }

    await assetDB.add(asset as unknown as DBAsset);
  };

  const updateAssetToDB = async (asset: DBAssetForm) => {
    for (const state of asset.states) {
      if (state.file) {
        // delete old asset source
        if (state.id) {
          await assetSourceDB.delete(state.id);
        }

        const ext = getFileInfo(state.file).ext;
        const id = await assetSourceDB.add({
          mime: state.file.type,
          blob: state.file,
          ext,
        });

        state.id = id;
        state.ext = ext;
      }

      delete state.file;
    }

    await assetDB.update(asset.id, asset as unknown as DBAsset);
  };

  const handleSubmitAddAsset = async (asset: DBAssetForm) => {
    if (asset.id) {
      updateAssetToDB(asset);
    } else {
      addAssetToDB(asset);
    }
    setEditingAsset(null);
  };

  const handleCancelAddAsset = () => {
    setEditingAsset(null);
  };

  const handleSelectAssetState = (state: DBAssetState) => {
    if (disableSelect) {
      return;
    }

    confirm({
      ...selectingAsset,
      stateId: state.id,
    });
    setSelectingAsset(null);
  };

  const handleCancelSelectAssetState = () => {
    setSelectingAsset(null);
  };

  useEffect(() => {
    if (defaultType) {
      setAssetType(defaultType);
    } else {
      setAssetType(DBAssetType.Character);
    }
  }, [defaultType]);

  const renderContent = () => {
    if (editingAsset) {
      return (
        <AssetForm
          asset={editingAsset}
          onSubmit={handleSubmitAddAsset}
          onCancel={handleCancelAddAsset}
        />
      );
    } else if (selectingAsset) {
      return (
        <AssetStateList
          asset={selectingAsset}
          onSelectState={handleSelectAssetState}
          onCancel={handleCancelSelectAssetState}
        />
      );
    } else {
      return (
        <>
          <div className="flex justify-between items-center">
            <Tabs value={assetType} onValueChange={handleChangeAssetType}>
              <TabsList>
                {DBAssetTypeOptions.map((tab) => {
                  return (
                    <TabsTrigger
                      key={tab.value}
                      value={tab.value}
                      disabled={defaultType && defaultType !== tab.value}
                    >
                      {tab.name}
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </Tabs>
            <Button size="sm" onClick={handleAddAsset}>
              <Icons.add className="w-3.5 h-3.5" />
              新增
            </Button>
          </div>
          <ScrollArea className="flex-grow">
            <div className="flex gap-2 flex-wrap">
              {assets?.map((asset) => {
                return (
                  <AssetCard
                    key={asset.id}
                    asset={asset}
                    onSelect={() => setSelectingAsset(asset)}
                    onEdit={() => handleEditAsset(asset)}
                    onDelete={() => handleDeleteAsset(asset)}
                  ></AssetCard>
                );
              })}
            </div>
          </ScrollArea>
        </>
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="min-w-[90vw] h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>素材库</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}
