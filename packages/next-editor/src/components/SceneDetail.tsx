import { DirectiveInput } from "@/components/DirectiveInput";
import { Button } from "@/components/ui/button";
import { useEditorStore } from "@/store";

export function SceneDetail() {
  const editor = useEditorStore((state) => state.editor);
  const activeScene = useEditorStore((state) => state.activeScene);

  function addDialogue() {
    editor.addDialogue({
      speaker: {
        name: "",
        label: "",
      },
      lines: [],
    });
  }

  return (
    <>
      <Button onClick={addDialogue}>新增对白</Button>
      {activeScene?.dialogues.map((dialogue, index) => {
        return (
          <div key={index}>
            <DirectiveInput
              value={dialogue}
              onChange={(value) => {
                editor.updateDialogue(index, value);
              }}
            ></DirectiveInput>
            <Button
              onClick={() => {
                editor.removeDialogue(dialogue);
              }}
            >
              删除
            </Button>
          </div>
        );
      })}
    </>
  );
}
