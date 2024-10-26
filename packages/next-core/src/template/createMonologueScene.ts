import { LayerZIndex } from "../editor";
import { Scene, Graphics, Text } from "../scene";

export function createMonologueScene() {
  const scene = new Scene();
  const maskRect = new Graphics();
  maskRect.alpha = 0.7;
  maskRect.beginFill(0x000000);
  maskRect.drawRect(0, 0, 1920, 1080);
  maskRect.endFill();
  maskRect.x = 0;
  maskRect.y = 0;
  maskRect.zIndex = LayerZIndex.Dialog;
  maskRect.label = "独白遮罩";

  const lineText = new Text("独白台词", {
    fill: 0xffffff,
    breakWords: true,
    wordWrap: true,
    wordWrapWidth: 1600,
    fontSize: 45,
    leading: 15,
  });

  lineText.x = 160;
  lineText.y = 160;
  lineText.zIndex = LayerZIndex.Text;
  lineText.label = "独白台词";
  lineText.disableTextEdit = true;

  scene.addChild(maskRect);
  scene.addChild(lineText);
  scene.config.speak.targetName = lineText.name;
  scene.config.speak.dialogTargetName = maskRect.name;

  return scene;
}
