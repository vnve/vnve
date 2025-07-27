import { LayerZIndex } from "../editor";
import { Scene, Graphics, Text } from "../scene";

interface LayoutConfig {
  dialogRect: {
    width: number;
    height: number;
    x: number;
    y: number;
  };
  nameText: {
    x: number;
    y: number;
    fontSize: number;
  };
  dialogText: {
    x: number;
    y: number;
    fontSize: number;
    wordWrapWidth: number;
  };
}

const LAYOUT_CONFIGS: Record<string, LayoutConfig> = {
  "1920x1080": {
    dialogRect: {
      width: 1920,
      height: 400,
      x: 0,
      y: 680,
    },
    nameText: {
      x: 160,
      y: 700,
      fontSize: 44,
    },
    dialogText: {
      x: 160,
      y: 770,
      fontSize: 38,
      wordWrapWidth: 1600,
    },
  },
  "1080x1920": {
    dialogRect: {
      width: 1080,
      height: 500,
      x: 0,
      y: 1420,
    },
    nameText: {
      x: 120,
      y: 1450,
      fontSize: 36,
    },
    dialogText: {
      x: 120,
      y: 1520,
      fontSize: 32,
      wordWrapWidth: 840,
    },
  },
};

export function createDialogueScene(options?: {
  width?: number;
  height?: number;
}) {
  const width = options?.width || 1920;
  const height = options?.height || 1080;
  const configKey = `${width}x${height}`;
  const layout = LAYOUT_CONFIGS[configKey];

  const scene = new Scene();

  const dialogRect = new Graphics();
  dialogRect.alpha = 0.7;
  dialogRect.beginFill(0x000000);
  dialogRect.drawRect(0, 0, layout.dialogRect.width, layout.dialogRect.height);
  dialogRect.endFill();
  dialogRect.x = layout.dialogRect.x;
  dialogRect.y = layout.dialogRect.y;
  dialogRect.zIndex = LayerZIndex.Dialog;
  dialogRect.label = "对话框";
  dialogRect.fillColor = "#000000";

  const nameText = new Text("角色名", {
    fill: 0xffffff,
    fontSize: layout.nameText.fontSize,
    fontWeight: "bold",
    leading: 15,
  });
  nameText.x = layout.nameText.x;
  nameText.y = layout.nameText.y;
  nameText.zIndex = LayerZIndex.Text;
  nameText.label = "角色名";
  nameText.disableTextEdit = true;

  const dialogText = new Text("角色台词", {
    fill: 0xffffff,
    wordWrap: true,
    breakWords: true,
    wordWrapWidth: layout.dialogText.wordWrapWidth,
    fontSize: layout.dialogText.fontSize,
    leading: 15,
  });
  dialogText.x = layout.dialogText.x;
  dialogText.y = layout.dialogText.y;
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
