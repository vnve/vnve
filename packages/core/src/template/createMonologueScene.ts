import { LayerZIndex } from "../editor";
import { Scene, Graphics, Text } from "../scene";

interface MonologueLayoutConfig {
  maskRect: {
    width: number;
    height: number;
    x: number;
    y: number;
  };
  lineText: {
    x: number;
    y: number;
    fontSize: number;
    wordWrapWidth: number;
  };
}

const MONOLOGUE_LAYOUT_CONFIGS: Record<string, MonologueLayoutConfig> = {
  "1920x1080": {
    maskRect: {
      width: 1920,
      height: 1080,
      x: 0,
      y: 0,
    },
    lineText: {
      x: 160,
      y: 160,
      fontSize: 45,
      wordWrapWidth: 1600,
    },
  },
  "1080x1920": {
    maskRect: {
      width: 1080,
      height: 1920,
      x: 0,
      y: 0,
    },
    lineText: {
      x: 120,
      y: 240,
      fontSize: 38,
      wordWrapWidth: 840,
    },
  },
};

export function createMonologueScene(options?: {
  width?: number;
  height?: number;
}) {
  const width = options?.width || 1920;
  const height = options?.height || 1080;
  const configKey = `${width}x${height}`;
  const layout = MONOLOGUE_LAYOUT_CONFIGS[configKey];

  const scene = new Scene();
  const maskRect = new Graphics();
  maskRect.alpha = 0.7;
  maskRect.beginFill(0x000000);
  maskRect.drawRect(0, 0, layout.maskRect.width, layout.maskRect.height);
  maskRect.endFill();
  maskRect.x = layout.maskRect.x;
  maskRect.y = layout.maskRect.y;
  maskRect.zIndex = LayerZIndex.Dialog;
  maskRect.label = "独白遮罩";

  const lineText = new Text("独白台词", {
    fill: 0xffffff,
    breakWords: true,
    wordWrap: true,
    wordWrapWidth: layout.lineText.wordWrapWidth,
    fontSize: layout.lineText.fontSize,
    leading: 15,
  });

  lineText.x = layout.lineText.x;
  lineText.y = layout.lineText.y;
  lineText.zIndex = LayerZIndex.Text;
  lineText.label = "独白台词";
  lineText.disableTextEdit = true;

  scene.addChild(maskRect);
  scene.addChild(lineText);
  scene.config.speak.targetName = lineText.name;
  scene.config.speak.dialogTargetName = maskRect.name;

  return scene;
}
