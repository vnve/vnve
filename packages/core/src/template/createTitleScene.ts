import { LayerZIndex } from "../editor";
import { Scene, Text } from "../scene";

interface TitleLayoutConfig {
  titleText: {
    x: number;
    y: number;
    fontSize: number;
  };
  subtitleText: {
    x: number;
    y: number;
    fontSize: number;
  };
}

const TITLE_LAYOUT_CONFIGS: Record<string, TitleLayoutConfig> = {
  "1920x1080": {
    titleText: {
      x: 960, // 1920/2
      y: 340, // 1080/2 - 200
      fontSize: 100,
    },
    subtitleText: {
      x: 960,
      y: 500, // 1080/2 - 40
      fontSize: 60,
    },
  },
  "1080x1920": {
    titleText: {
      x: 540, // 1080/2
      y: 760, // 1920/2 - 200
      fontSize: 80,
    },
    subtitleText: {
      x: 540,
      y: 920, // 1920/2 - 40
      fontSize: 48,
    },
  },
};

export function createTitleScene(options?: {
  width?: number;
  height?: number;
}) {
  const width = options?.width || 1920;
  const height = options?.height || 1080;
  const configKey = `${width}x${height}`;
  const layout = TITLE_LAYOUT_CONFIGS[configKey];

  const scene = new Scene();

  const titleText = new Text("主标题", {
    fill: 0xffffff,
    breakWords: true,
    fontSize: layout.titleText.fontSize,
    fontWeight: "bold",
  });

  // 由于Text的锚点默认在左上角，需要调整位置使其居中
  titleText.x = layout.titleText.x - titleText.width / 2;
  titleText.y = layout.titleText.y;
  titleText.zIndex = LayerZIndex.Text;
  titleText.label = "主标题";

  const subtitleText = new Text("副标题", {
    fill: 0xffffff,
    breakWords: true,
    fontSize: layout.subtitleText.fontSize,
  });

  subtitleText.x = layout.subtitleText.x - subtitleText.width / 2;
  subtitleText.y = layout.subtitleText.y;
  subtitleText.zIndex = LayerZIndex.Text;
  subtitleText.label = "副标题";

  scene.addChild(titleText);
  scene.addChild(subtitleText);

  scene.dialogues = [
    {
      speak: {
        wordsPerMin: 500,
        interval: 0.2,
        effect: "typewriter",
        speaker: {
          targetName: "",
          name: "",
          autoShowSpeaker: {
            inEffect: "Show",
          },
          autoMaskOtherSpeakers: {
            alpha: 0.5,
          },
          speakerTargetName: "Narrator",
        },
      },
      lines: [
        {
          children: [
            {
              text: "",
            },
            {
              children: [
                {
                  text: "",
                },
              ],
              type: "directive",
              value: {
                directive: "FadeIn",
                params: {
                  targetName: titleText.name,
                },
                label: "渐入:主标题",
              },
            },
            {
              text: "",
            },
            {
              children: [
                {
                  text: "",
                },
              ],
              type: "directive",
              value: {
                directive: "FadeIn",
                params: {
                  targetName: subtitleText.name,
                },
                label: "渐入:副标题",
              },
            },
            {
              text: "",
            },
            {
              children: [
                {
                  text: "",
                },
              ],
              type: "directive",
              value: {
                directive: "Wait",
                params: {
                  duration: 3,
                },
                label: "停顿:3秒",
              },
            },
            {
              text: "",
            },
          ],
          type: "p",
        },
      ],
    },
  ];

  return scene;
}
