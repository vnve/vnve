import DirectiveInput from "@/components/DirectiveInput";
import { Button } from "@/components/ui/button";
import { assetDB, assetSourceDB } from "@/db";
import { useEditorStore } from "@/store";
import { Scene, Text } from "@vnve/next-core";
import { useEffect, useRef, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";

export default function EditorPage() {
  const initEditor = useEditorStore((state) => state.initEditor);
  const editor = useEditorStore((state) => state.editor);
  const activeChild = useEditorStore((state) => state.activeChild);
  const activeScene = useEditorStore((state) => state.activeScene);
  const scenes = useEditorStore((state) => state.scenes);
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

  useEffect(() => {
    initEditor(document.getElementById("editor") as HTMLCanvasElement);
  }, [initEditor]);

  return (
    <div>
      <h1>Editor Page</h1>
      <DirectiveInput></DirectiveInput>
      Button: <Button>Click me</Button>
      <ul>
        {list?.map((item) => {
          return (
            <li key={item.id}>
              {item.id}
              <ul>
                {item.states.map((state) => {
                  return (
                    <li key={state.id}>
                      {state.name}
                      <img src={state.url} alt={state.name} />
                    </li>
                  );
                })}
              </ul>
            </li>
          );
        })}
      </ul>
      <ul>
        <li>
          <button onClick={handleAddAsset}>add Asset</button>
        </li>
        <li>
          <input type="file" ref={fileInputRef} />
          <button onClick={handleAddAssetState}>add AssetState</button>
        </li>
      </ul>
      <div>=========</div>
      <button
        onClick={() => {
          editor.addScene(new Scene());
        }}
      >
        add Scene
      </button>
      <button
        onClick={() => {
          editor.updateActiveScene((scene) => {
            scene.name = "new name";
          });
          editor.addChild(new Text("12313123"));
        }}
      >
        changeActiveScene
      </button>
      scenes:
      <ul>
        {scenes.map((scene) => (
          <li key={scene.name} onClick={() => editor.setActiveScene(scene)}>
            {scene.name}
          </li>
        ))}
      </ul>
      activeScene:{" "}
      <div>
        {activeScene?.name} {activeScene?.children.length}
        <ul>
          {activeScene?.children.map((child) => (
            <li key={child.name} onClick={() => editor.setActiveChild(child)}>
              {child.name} {child.x} {child.y}
            </li>
          ))}
        </ul>
      </div>
      <div>
        activeChild:
        <div>{activeChild?.name}</div>
        <button
          onClick={() => {
            editor.updateActiveChild((child) => {
              child.name = "new child";
              child.x = 100;
            });
          }}
        >
          changeActiveChild
        </button>
      </div>
      canvas: <canvas id="editor"></canvas>
    </div>
  );
}
