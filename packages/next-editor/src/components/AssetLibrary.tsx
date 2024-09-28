import { useEffect, useRef, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Button } from "@/components/ui/button";
import {
  assetDB,
  assetSourceDB,
  DBAsset,
  DBAssetType,
  getAssetSourceURL,
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

const TabNameList = [
  {
    name: "角色",
    value: DBAssetType.Character,
  },
  {
    name: "背景",
    value: DBAssetType.Background,
  },
  {
    name: "物品",
    value: DBAssetType.Thing,
  },
  {
    name: "音频",
    value: DBAssetType.Audio,
  },
  // {
  //   name: "视频",
  //   value: DBAssetType.Video,
  // },
];

export function AssetLibrary() {
  const isOpen = useAssetStore((state) => state.isOpen);
  const confirm = useAssetStore((state) => state.confirm);
  const cancel = useAssetStore((state) => state.cancel);
  const defaultType = useAssetStore((state) => state.type);
  const [assetType, setAssetType] = useState(defaultType);
  const [assetName, setAssetName] = useState("");
  const [assetStateName, setAssetStateName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
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
    assetDB.add({
      name: assetName,
      type: DBAssetType.Character,
      states: [],
    });
  };

  const handleDeleteAsset = (asset: DBAsset) => {
    asset.states.forEach((state) => {
      assetSourceDB.delete(state.id);
    });

    assetDB.delete(asset.id);
  };

  const handleAddAssetState = async (asset: DBAsset) => {
    if (fileInputRef.current && fileInputRef.current.files) {
      const file = fileInputRef.current.files[0];
      const ext = file.name.split(".").pop() || "";

      if (file) {
        const id = await assetSourceDB.add({
          mime: file.type,
          blob: file,
          ext,
        });

        assetDB
          .where("id")
          .equals(asset.id)
          .modify((item) =>
            item.states.push({ id, name: assetStateName, ext }),
          );
      }
    }
  };

  const handleDeleteAssetState = (asset: DBAsset, id: number) => {
    assetSourceDB.delete(id);
    assetDB
      .where("id")
      .equals(asset.id)
      .modify((item) => {
        item.states = item.states.filter((state) => state.id !== id);
      });
  };

  const handleClose = () => {
    cancel();
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
        <div className="flex justify-between items-center">
          <Tabs value={assetType} onValueChange={handleChangeAssetType}>
            <TabsList>
              {TabNameList.map((tab) => {
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
          <Button size="sm">新增</Button>
        </div>
        <ScrollArea className="flex-grow">
          <div className="grid w-full lg:max-w-sm items-center gap-1.5">
            <Label htmlFor="picture">Picture</Label>
            <Input id="picture" type="file" />
          </div>
          <input
            type="text"
            value={assetName}
            onChange={(e) => setAssetName(e.target.value)}
          />
          <Button onClick={handleAddAsset}>add Asset</Button>
          <ul>
            {assets?.map((asset) => {
              return (
                <li key={asset.id}>
                  <p onClick={() => confirm(asset)}>
                    {asset.id} {asset.name}
                  </p>
                  <Button onClick={() => handleDeleteAsset(asset)}>
                    delete
                  </Button>

                  <ul>
                    {asset.states.map((state) => {
                      return (
                        <li key={state.id}>
                          <b>{state.name}</b>
                          <img
                            className="w-[160px] h-[90px]"
                            src={getAssetSourceURL(state.id, state.ext)}
                            alt={state.name}
                          />
                          <Button
                            onClick={() =>
                              handleDeleteAssetState(asset, state.id)
                            }
                          >
                            delete AssetState
                          </Button>
                        </li>
                      );
                    })}

                    <li>
                      <input
                        type="text"
                        value={assetStateName}
                        onChange={(e) => setAssetStateName(e.target.value)}
                      />
                      <input type="file" ref={fileInputRef} />
                      <Button onClick={() => handleAddAssetState(asset)}>
                        add AssetState
                      </Button>
                    </li>
                  </ul>
                </li>
              );
            })}
          </ul>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
