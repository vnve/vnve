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
  getAssetSourceURL,
  TMP_PREFIX,
  NARRATOR_ASSET_ID,
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
import { cn, getFileInfo } from "@/lib/utils";
import { loadFont } from "@/lib/font";
import { useMedia } from "@/components/hooks/useMedia";

export type DBAssetForm = DBAsset & {
  states: (DBAssetState & { file?: File })[];
};

export function AssetLibrary() {
  const isSm = useMedia("(min-width: 640px)");
  const isOpen = useAssetStore((state) => state.isOpen);
  const confirm = useAssetStore((state) => state.confirm);
  const cancel = useAssetStore((state) => state.cancel);
  const disableSelect = useAssetStore((state) => state.disableSelect);
  const defaultType = useAssetStore((state) => state.type);
  const [assetType, setAssetType] = useState(defaultType);
  const [editingAsset, setEditingAsset] = useState<DBAsset | null>(null);
  const [selectingAsset, setSelectingAsset] = useState<DBAsset | null>(null);
  const assets = useLiveQuery(async () => {
    if (assetType) {
      const list = await assetDB
        .where("type")
        .equals(assetType)
        .and((asset) => !asset.name.startsWith(TMP_PREFIX))
        .reverse()
        .toArray();

      if (assetType === DBAssetType.Character) {
        const targetItemIndex = list.findIndex(
          (item) => item.id === NARRATOR_ASSET_ID,
        );

        if (targetItemIndex !== -1) {
          // 将旁白移到第一位
          const targetItem = list[targetItemIndex];
          list.splice(targetItemIndex, 1);
          list.unshift(targetItem);
        }
      }

      return list;
    }

    return [];
  }, [assetType]);

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

      // 字体特殊逻辑，立刻加载至页面
      if (asset.type === DBAssetType.Font) {
        loadFont(state.name, getAssetSourceURL(state));
      }
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

        // 字体特殊逻辑，立刻加载至页面
        if (asset.type === DBAssetType.Font) {
          loadFont(state.name, getAssetSourceURL(state));
        }
      }

      delete state.file;
    }

    await assetDB.update(asset.id, asset as unknown as DBAsset);
  };

  const handleSubmitAddAsset = async (asset: DBAssetForm) => {
    if (asset.id) {
      await updateAssetToDB(asset);

      // 如果存在选中，更新当前选中素材状态
      if (selectingAsset) {
        const editedAsset = await assetDB.get(asset.id);
        setSelectingAsset(editedAsset);
      }
    } else {
      await addAssetToDB(asset);
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
          onEdit={(asset) => handleEditAsset(asset)}
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
              <Icons.squarePlus className="w-3.5 h-3.5 mr-0.5" />
              {isSm && "新增"}
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
      <DialogContent
        id="asset-library"
        className={cn("min-w-[90vw] h-[90vh] flex flex-col", !isSm && "px-2")}
      >
        <DialogHeader>
          <DialogTitle>素材库</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}
