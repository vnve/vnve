import { DirectiveInput } from "@/components/DirectiveInput";
import { Button } from "@/components/ui/button";
import { useEditorStore } from "@/store";
import { Input } from "@/components/ui/input";
import { Label } from "./ui/label";

export function SceneDetail() {
  const editor = useEditorStore((state) => state.editor);
  const activeScene = useEditorStore((state) => state.activeScene);

  function handleAddDialogue() {
    editor.addDialogue({
      speaker: {
        name: "",
        label: "",
      },
      lines: [],
    });
  }

  function handleChangeSceneName(value: string) {
    editor.updateActiveScene((scene) => {
      scene.label = value;
    });
  }

  return (
    <>
      {activeScene && (
        <>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="sceneName">场景名称</Label>
            <Input
              type="text"
              id="sceneName"
              placeholder="请输入场景名称"
              value={activeScene.label}
              onChange={(event) => handleChangeSceneName(event.target.value)}
            />
          </div>
          {activeScene.dialogues.map((dialogue, index) => {
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
          <Button onClick={handleAddDialogue}>新增对白</Button>
        </>
      )}
    </>
  );
}
