import { useEffect, useRef, useState, useCallback } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Button } from "@/components/ui/button";
import { assetDB, assetSourceDB, DBAsset, DBAssetType } from "@/db";
import { useAssetStore } from "@/store";

export function AssetLibrary() {
  const isOpen = useAssetStore((state) => state.isOpen);
  const confirm = useAssetStore((state) => state.confirm);
  const cancel = useAssetStore((state) => state.cancel);
  const type = useAssetStore((state) => state.type);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // TODO: 额外需要支持一种禁用状态，只选择角色/背景/音乐/音效
  const assets = useLiveQuery(() =>
    assetDB.where("type").anyOf(DBAssetType.Character).reverse().toArray(),
  );
  const [list, setList] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const result = [];
      for (const asset of assets) {
        const states = [];

        for (const stateId of asset.states) {
          const state = await assetSourceDB.get(stateId);
          states.push(state);
        }

        result.push({
          ...asset,
          states,
        });
      }

      setList(result);
    };

    if (assets) {
      fetchData();
    }
  }, [assets]);

  const handleAddAsset = () => {
    assetDB.add({
      name: "test",
      type: DBAssetType.Character,
      states: [],
    });
  };

  const handleAddAssetState = async (asset: DBAsset) => {
    if (fileInputRef.current && fileInputRef.current.files) {
      const file = fileInputRef.current.files[0];
      if (file) {
        const id = await assetSourceDB.add({
          name: file.name,
          mime: file.type,
          blob: file,
          url: "",
        });

        assetDB
          .where("id")
          .equals(asset.id)
          .modify((item) => item.states.push(id));
      }
    }
  };

  return (
    isOpen && (
      <div className="fixed top-0 left-0 w-full h-full bg-gray-200">
        AssetLibrary <Button onClick={() => cancel()}>关闭</Button>
        <Button onClick={handleAddAsset}>add Asset</Button>
        <ul>
          {list?.map((item) => {
            return (
              <li key={item.id} onClick={() => confirm(item)}>
                {item.id}
                <ul>
                  {item.states.map((state) => {
                    return (
                      <li key={state.id}>
                        {state.name}
                        <img
                          className="w-[160px] h-[90px]"
                          src={state.url}
                          alt={state.name}
                        />
                      </li>
                    );
                  })}

                  <li>
                    <input type="file" ref={fileInputRef} />
                    <Button onClick={() => handleAddAssetState(item)}>
                      add AssetState
                    </Button>
                  </li>
                </ul>
              </li>
            );
          })}
        </ul>
      </div>
    )
  );
}
