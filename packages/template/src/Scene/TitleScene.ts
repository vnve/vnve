import {
  Scene,
  Text,
  Converter,
  Img,
  ImgSource,
  ISoundOption,
  Sound,
  PREST_ANIMATION,
} from "@vnve/core";
import { getChildFromChildren } from "../Utils";

interface ITitleSceneOption {
  duration: number;
  title: string;
  subtitle?: string;
  soundSources?: ISoundOption[];
  backgroundImgSource?: ImgSource;
}

export class TitleScene extends Scene {
  public titleText: Text;
  public subtitleText?: Text;
  public backgroundImg?: Img;

  constructor(options: ITitleSceneOption) {
    super({ duration: options.duration });

    this.type = "TitleScene";
    const titleText = new Text(options.title, {
      fill: 0xffffff,
      breakWords: true,
      fontSize: Converter.fontSize(100),
      fontWeight: "bold",
    });

    titleText.x = Converter.width(1920) / 2 - titleText.width / 2;
    titleText.y = Converter.width(1080) / 2 - 200;
    titleText.addAnimation({
      name: "EnterFromTop",
      value: PREST_ANIMATION.EnterFromTop,
    });
    this.titleText = titleText;
    this.addChild(titleText);

    const subtitleText = new Text(options.subtitle ?? "副标题", {
      fill: 0xffffff,
      breakWords: true,
      fontSize: Converter.fontSize(60),
    });

    subtitleText.x = Converter.width(1920) / 2 - subtitleText.width / 2;
    subtitleText.y = Converter.width(1080) / 2 - 40;
    subtitleText.addAnimation({
      name: "EnterFromBottom",
      value: PREST_ANIMATION.EnterFromBottom,
    });
    this.subtitleText = subtitleText;
    this.addChild(subtitleText);

    if (options.backgroundImgSource) {
      this.setBackgroundImg(new Img({ source: options.backgroundImgSource }));
    }

    if (options.soundSources) {
      options.soundSources.forEach((item) => {
        const sound = new Sound(item);

        this.addSound(sound);
      });
    }
  }

  public setBackgroundImg(backgroundImg: Img) {
    backgroundImg.width = Converter.width(1920);
    backgroundImg.height = Converter.height(1080);
    backgroundImg.x = 0;
    backgroundImg.y = 0;

    this.removeBackgroundImg();
    this.backgroundImg = backgroundImg;
    this.addChild(backgroundImg);
    this.setChildToBottom(backgroundImg);
  }

  public removeBackgroundImg() {
    if (this.backgroundImg) {
      this.removeChild(this.backgroundImg);
      this.backgroundImg = undefined;
    }
  }

  public clone() {
    const cloned = new TitleScene({
      title: "",
      duration: this.duration,
    });

    cloned.removeChildren();
    cloned.cloneFrom(this);

    cloned.titleText = getChildFromChildren(cloned.children, this.titleText);
    cloned.subtitleText = getChildFromChildren(
      cloned.children,
      this.subtitleText,
    );
    cloned.backgroundImg = getChildFromChildren(
      cloned.children,
      this.backgroundImg,
    );

    return cloned;
  }
}
