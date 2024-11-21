import { LayerZIndex } from "../editor";
import { Scene, Text } from "../scene";

export function createTitleScene() {
  const scene = new Scene();

  const titleText = new Text("主标题", {
    fill: 0xffffff,
    breakWords: true,
    fontSize: 100,
    fontWeight: "bold",
  });

  titleText.x = 1920 / 2 - titleText.width / 2;
  titleText.y = 1080 / 2 - 200;
  titleText.zIndex = LayerZIndex.Text;
  titleText.label = "主标题";

  const subtitleText = new Text("副标题", {
    fill: 0xffffff,
    breakWords: true,
    fontSize: 60,
  });

  subtitleText.x = 1920 / 2 - subtitleText.width / 2;
  subtitleText.y = 1080 / 2 - 40;
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
