import {
  Scene,
  Img,
  Graphics,
  Text,
  Power0,
  Converter,
  ImgSource,
  Sound,
  ISoundOption,
} from "@vnve/core";
import {
  DEFAULT_WORDS_PER_MINUTE,
  LINE_GAP_TIME,
  LINE_FADE_IN_DURATION,
  getChildFromChildren,
  readingTime,
} from "../Utils";

interface ICharacterLine {
  name: string;
  content: string;
  start?: number;
  duration?: number;
  displayEffect?: LineDisplayEffectType;
  wordsPerMinute?: number;
  gapTime?: number;
}

type LineDisplayEffectType = "typewriter" | "fadeIn" | "none";

interface IDialogueSceneOptions {
  lines: ICharacterLine[];
  dialogImgSource?: ImgSource;
  backgroundImgSource?: ImgSource;
  soundSources?: ISoundOption[];
  wordsPerMinute?: number;
  lineDisplayEffect?: LineDisplayEffectType;
}

export class DialogueScene extends Scene {
  public nameText?: Text;
  public dialogText?: Text;
  public dialogRect?: Graphics;
  public lines: ICharacterLine[];
  public characterImgs: Img[];
  public backgroundImg?: Img;
  public dialogImg?: Img;
  public wordsPerMinute?: number;
  public lineDisplayEffect: LineDisplayEffectType;

  constructor(options: IDialogueSceneOptions) {
    super({ duration: 0 });

    this.type = "DialogueScene";
    this.wordsPerMinute = options.wordsPerMinute || DEFAULT_WORDS_PER_MINUTE;
    this.lineDisplayEffect = options.lineDisplayEffect || "typewriter";

    const dialogRect = new Graphics();
    dialogRect.alpha = 0.7;
    dialogRect.beginFill(0x000000);
    dialogRect.drawRect(0, 0, Converter.width(1920), Converter.height(400));
    dialogRect.endFill();
    dialogRect.x = 0;
    dialogRect.y = Converter.y(680);

    const nameText = new Text("角色名", {
      fill: 0xffffff,
      fontSize: Converter.fontSize(44),
      fontWeight: "bold",
    });
    nameText.x = Converter.x(160);
    nameText.y = Converter.y(700);

    const dialogText = new Text("角色台词", {
      fill: 0xffffff,
      wordWrap: true,
      breakWords: true,
      wordWrapWidth: Converter.width(1600),
      fontSize: Converter.fontSize(38),
      leading: 15,
    });
    dialogText.x = Converter.x(160);
    dialogText.y = Converter.y(770);

    this.addChild(dialogRect);
    this.addChild(dialogText);
    this.addChild(nameText);
    this.dialogRect = dialogRect;
    this.dialogText = dialogText;
    this.nameText = nameText;
    this.characterImgs = [];
    this.lines = [];
    this.setLines(options.lines);

    if (options.dialogImgSource) {
      this.setDialogImg(new Img({ source: options.dialogImgSource }));
    }

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

  public setDialogImg(dialogImg: Img) {
    dialogImg.x = 60;
    dialogImg.y = 700;

    this.removeDialogImg();
    this.dialogImg = dialogImg;
    this.addChild(dialogImg);
    if (this.dialogRect) {
      this.setChildIndex(dialogImg, this.getChildIndex(this.dialogRect));
      this.removeChild(this.dialogRect);
      this.dialogRect = undefined;
    }
  }

  public removeDialogImg() {
    if (this.dialogImg) {
      this.removeChild(this.dialogImg);
      this.dialogImg = undefined;
    }
  }

  public addCharacterImg(characterImg: Img) {
    this.characterImgs.push(characterImg);
    this.addChild(characterImg);
    this.setChildIndex(characterImg, 1);
  }

  public removeCharacterImg(characterImg: Img) {
    this.characterImgs = this.characterImgs.filter(
      (item) => item.uuid !== characterImg.uuid,
    );
    this.removeChild(characterImg);
  }

  public setLines(lines: ICharacterLine[]) {
    this.lines = lines;
    this.clearLinesAnimation();
    this.setLinesAnimation(lines);

    const duration = this.getLinesDuration();
    this.setDuration(duration);
  }

  public getLinesDuration() {
    if (this.lines.length === 0) {
      return 0;
    }

    const lastLine = this.lines[this.lines.length - 1];

    return (
      lastLine.start! + lastLine.duration! + (lastLine.gapTime ?? LINE_GAP_TIME)
    );
  }

  public getLinePositionStartTime(lineIndex: number, position: number) {
    const line = this.lines[lineIndex];
    let startTime = line.start!;

    startTime += readingTime(
      line.content.slice(0, position),
      this.wordsPerMinute,
    );

    return startTime;
  }

  private clearLinesAnimation() {
    this.nameText?.removeAllAnimation();
    this.dialogText?.removeAllAnimation();
  }

  private setLinesAnimation(lines: ICharacterLine[]) {
    lines.forEach((line, index) => {
      const lineReadingTime = readingTime(
        line.content,
        line.wordsPerMinute ?? this.wordsPerMinute,
      );

      line.duration = lineReadingTime;
      line.start =
        index === 0
          ? 0
          : lines[index - 1].start! +
            lines[index - 1].duration! +
            (lines[index - 1].gapTime ?? LINE_GAP_TIME);

      const lineDisplayEffect = line.displayEffect ?? this.lineDisplayEffect;

      if (lineDisplayEffect === "typewriter") {
        this.nameText?.addAnimation({
          value: [
            {
              text: "",
            },
            {
              text: line.name,
              delay: line.start,
              ease: Power0.easeNone,
            },
          ],
        });

        this.dialogText?.addAnimation({
          value: [
            {
              text: "",
            },
            {
              text: line.content,
              duration: line.duration,
              delay: line.start,
              ease: Power0.easeNone,
            },
          ],
        });
      } else if (lineDisplayEffect === "fadeIn") {
        this.nameText?.addAnimation({
          value: [
            {
              text: line.name,
              alpha: 0,
            },
            {
              alpha: 1,
              duration:
                line.duration < LINE_GAP_TIME ? line.duration : LINE_GAP_TIME,
              delay: line.start,
            },
          ],
        });
        this.dialogText?.addAnimation({
          value: [
            {
              text: line.content,
              alpha: 0,
            },
            {
              alpha: 1,
              duration:
                line.duration < LINE_GAP_TIME ? line.duration : LINE_GAP_TIME,
              delay: line.start,
            },
          ],
        });
      } else if (lineDisplayEffect === "none") {
        this.nameText?.addAnimation({
          value: [
            {
              text: "",
            },
            {
              text: line.name,
              delay: line.start,
              ease: Power0.easeNone,
            },
          ],
        });

        this.dialogText?.addAnimation({
          value: [
            {
              text: "",
            },
            {
              text: line.content,
              delay: line.start,
              ease: Power0.easeNone,
            },
          ],
        });
      }
    });
  }

  public clone() {
    const cloned = new DialogueScene({
      lines: this.lines.map((item) => ({ ...item })),
      lineDisplayEffect: this.lineDisplayEffect,
      wordsPerMinute: this.wordsPerMinute,
    });

    cloned.removeChildren();
    cloned.cloneFrom(this);

    cloned.nameText = getChildFromChildren(cloned.children, this.nameText);
    cloned.dialogText = getChildFromChildren(cloned.children, this.dialogText);
    cloned.dialogImg = getChildFromChildren(cloned.children, this.dialogImg);
    cloned.dialogRect = getChildFromChildren(cloned.children, this.dialogRect);
    cloned.backgroundImg = getChildFromChildren(
      cloned.children,
      this.backgroundImg,
    );
    cloned.characterImgs = this.characterImgs
      .map((item) => {
        return getChildFromChildren(cloned.children, item);
      })
      .filter((item) => !!item);

    return cloned;
  }
}
