import { DirectiveInput } from "./DirectiveInput";
import { Button } from "@/components/ui/button";
import { useEditorStore } from "@/store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialogue, Text } from "@vnve/next-core";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { SaveAsTemplateDialog } from "../TemplateLibrary";

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

  function handleUpdateDialogue(index: number, value: Dialogue) {
    editor.updateDialogue(index, value);
    // 单向同步至画布元素，只改变画布中的值
    if (activeScene) {
      const { name, text } = activeScene.config.speak?.target || {};

      if (value.speaker.label) {
        const nameChild = editor.activeScene.getChildByName(name) as Text;

        nameChild.text = value.speaker.label;
      }

      if (value.lines.length > 0) {
        const textChild = editor.activeScene.getChildByName(text) as Text;
        let speakText = "";

        value.lines.forEach((line) => {
          if (line.type === "p") {
            for (let index = 0; index < line.children.length; index++) {
              const child = line.children[index];

              if (!child.type) {
                let text = child.text;

                if (index === line.children.length - 1) {
                  // 最后一个元素是文本，增加换行符
                  text += "\n";
                }

                speakText += text;
              }
            }
          }
        });

        if (speakText) {
          textChild.text = speakText;
        }
      }
    }
  }

  return (
    <>
      {activeScene && (
        <Card className="w-full flex-1 h-full rounded-md">
          <CardContent className="h-full p-4">
            <ScrollArea className="w-full h-full pr-4">
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="sceneName">场景名称</Label>
                <Input
                  type="text"
                  id="sceneName"
                  placeholder="请输入场景名称"
                  value={activeScene.label}
                  onChange={(event) =>
                    handleChangeSceneName(event.target.value)
                  }
                />
              </div>
              <SaveAsTemplateDialog sceneName={activeScene.name}>
                <Button>保存为模版</Button>
              </SaveAsTemplateDialog>
              {activeScene.dialogues.map((dialogue, index) => {
                return (
                  <div key={index}>
                    <DirectiveInput
                      value={dialogue}
                      onChange={(value) => handleUpdateDialogue(index, value)}
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
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </>
  );
}
