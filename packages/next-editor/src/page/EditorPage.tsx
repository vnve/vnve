import { SceneList } from "@/components/SceneList";
import { SceneEditor } from "@/components/SceneEditor";
import { SceneDetail } from "@/components/SceneDetail";
import { AssetLibrary } from "@/components/AssetLibrary";

export default function EditorPage() {
  return (
    <div>
      <SceneDetail></SceneDetail>
      <SceneList></SceneList>
      <SceneEditor></SceneEditor>
      <AssetLibrary></AssetLibrary>
    </div>
  );
}
