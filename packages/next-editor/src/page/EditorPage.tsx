import { assetDB, assetSourceDB } from "@/db";
import { useEffect, useRef, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { SceneList } from "@/components/SceneList";
import { SceneEditor } from "@/components/SceneEditor";
import { SceneDetail } from "@/components/SceneDetail";

export default function EditorPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const assets = useLiveQuery(() =>
    assetDB.where("type").anyOf("Character").reverse().toArray(),
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
      type: "Character",
      states: [],
      defaultState: 0,
    });
  };

  const handleAddAssetState = async () => {
    if (fileInputRef.current && fileInputRef.current.files) {
      const file = fileInputRef.current.files[0];
      if (file) {
        const id = await assetSourceDB.add({
          name: file.name,
          mime: file.type,
          blob: file,
          url: "",
        });

        console.log(assetSourceDB);

        assetDB
          .where("id")
          .equals(1)
          .modify((item) => item.states.push(id));
      }
    }
  };

  return (
    <div>
      <SceneDetail></SceneDetail>
      <SceneList></SceneList>
      <SceneEditor></SceneEditor>
    </div>
  );
}
