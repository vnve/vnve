import { templateDB } from "@/db";
import { useEditorStore } from "@/store";
import {
  createDialogueScene,
  createTitleScene,
  createMonologueScene,
  Scene,
} from "@vnve/core";
import { useLiveQuery } from "dexie-react-hooks";

const DEFAULT_SCENE_TEMPLATES = [
  {
    name: "对话",
    content: createDialogueScene,
  },
  {
    name: "独白",
    content: createMonologueScene,
  },
  {
    name: "标题",
    content: createTitleScene,
  },
  {
    name: "空白",
    content: () => new Scene(),
  },
];

export function useTemplates() {
  const editor = useEditorStore((state) => state.editor);
  const customTemplates = useLiveQuery(() => templateDB.reverse().toArray());

  const handleAddDefaultTemplate =
    (createTemplateScene: () => Scene, index?: number) => () => {
      const newScene = createTemplateScene();

      editor.addScene(newScene, index);
      editor.setActiveSceneByName(newScene.name);
    };

  const handleAddCustomTemplate = async (
    templateContent: string,
    index?: number,
  ) => {
    const newScene = await Scene.fromJSON(JSON.parse(templateContent), false);

    editor.addScene(newScene, index);
    editor.setActiveSceneByName(newScene.name);
  };

  return {
    defaultTemplates: DEFAULT_SCENE_TEMPLATES,
    customTemplates: customTemplates || [],
    handleAddDefaultTemplate,
    handleAddCustomTemplate,
  };
}
