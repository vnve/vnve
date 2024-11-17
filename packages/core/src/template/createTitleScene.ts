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

  // TODO: 增加动画指令

  return scene;
}
