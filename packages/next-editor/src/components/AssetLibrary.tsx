import { useEffect, useRef, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Button } from "@/components/ui/button";
import {
  assetDB,
  assetSourceDB,
  DBAsset,
  DBAssetType,
  getAssetSourceURL,
  DBAssetTypeOptions,
  DBAssetState,
  DBAssetTypeNameMap,
} from "@/db";
import { useAssetStore } from "@/store";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { AssetForm } from "./AssetForm";

export type DBAssetForm = DBAsset & {
  states: (DBAssetState & { file?: File })[];
};

export function AssetLibrary() {
  const isOpen = useAssetStore((state) => state.isOpen);
  const confirm = useAssetStore((state) => state.confirm);
  const cancel = useAssetStore((state) => state.cancel);
  const defaultType = useAssetStore((state) => state.type);
  const [assetType, setAssetType] = useState(defaultType);
  const [assetName, setAssetName] = useState("");
  const [editingAsset, setEditingAsset] = useState<DBAsset | null>(null);
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
  };

  const addAssetToDB = async (asset: DBAssetForm) => {
    for (const state of asset.states) {
      const ext = state.file.name.split(".").pop() || "";
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

        const ext = state.file.name.split(".").pop() || "";
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

  useEffect(() => {
    if (defaultType) {
      setAssetType(defaultType);
    } else {
      setAssetType(DBAssetType.Character);
    }
  }, [defaultType]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="min-w-[90vw] h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>素材库</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        {editingAsset ? (
          <AssetForm
            asset={editingAsset}
            onSubmit={handleSubmitAddAsset}
            onCancel={() => {
              setEditingAsset(null);
            }}
          />
        ) : (
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
                新增{DBAssetTypeNameMap[assetType]}
              </Button>
            </div>
            <ScrollArea className="flex-grow">
              <ul>
                {assets?.map((asset) => {
                  return (
                    <li key={asset.id}>
                      <img
                        onClick={() => confirm(asset)}
                        className="w-[160px] h-[90px]"
                        src={getAssetSourceURL(
                          asset.states[0].id,
                          asset.states[0].ext,
                        )}
                      />
                      <p>
                        {asset.id} {asset.name}
                      </p>
                      <Button size="sm" onClick={() => handleEditAsset(asset)}>
                        编辑
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleDeleteAsset(asset)}
                      >
                        删除
                      </Button>
                    </li>
                  );
                })}
              </ul>
            </ScrollArea>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
