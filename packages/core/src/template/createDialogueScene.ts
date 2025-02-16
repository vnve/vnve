import { LayerZIndex } from "../editor";
import { Scene, Graphics, Text } from "../scene";

export function createDialogueScene() {
  const scene = new Scene();

  const dialogRect = new Graphics();
  dialogRect.alpha = 0.7;
  dialogRect.beginFill(0x000000);
  dialogRect.drawRect(0, 0, 1920, 400);
  dialogRect.endFill();
  dialogRect.x = 0;
  dialogRect.y = 680;
  dialogRect.zIndex = LayerZIndex.Dialog;
  dialogRect.label = "对话框";
  dialogRect.fillColor = "#000000";

  const nameText = new Text("角色名", {
    fill: 0xffffff,
    fontSize: 44,
    fontWeight: "bold",
    leading: 15,
  });
  nameText.x = 160;
  nameText.y = 700;
  nameText.zIndex = LayerZIndex.Text;
  nameText.label = "角色名";
  nameText.disableTextEdit = true;

  const dialogText = new Text("角色台词", {
    fill: 0xffffff,
    wordWrap: true,
    breakWords: true,
    wordWrapWidth: 1600,
    fontSize: 38,
    leading: 15,
  });
  dialogText.x = 160;
  dialogText.y = 770;
  dialogText.zIndex = LayerZIndex.Text;
  dialogText.label = "角色台词";
  dialogText.disableTextEdit = true;

  scene.addChild(dialogRect);
  scene.addChild(nameText);
  scene.addChild(dialogText);
  scene.config.speak.targetName = dialogText.name;
  scene.config.speak.dialogTargetName = dialogRect.name;
  scene.config.speak.speaker.targetName = nameText.name;
  scene.config.speak.speaker.name = nameText.text;

  return scene;
}
