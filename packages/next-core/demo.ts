import * as PIXI from "pixi.js";
import { Director, Screenplay } from "./src/Director/Director";
import { Compositor, Previewer } from "./src/connector";

// const app = new PIXI.Application({
//   view: document.getElementById("canvas") as HTMLCanvasElement,
//   width: 1920,
//   height: 1080,
//   autoStart: false,
// });
const director = new Director({
  // renderer: app.renderer,
});

const scene1 = new PIXI.Container();

// 创建一个文字
const text = new PIXI.Text("Hello World", {
  fill: 0xff0000,
  fontFamily: "Arial",
  fontSize: 60,
  fontWeight: "bold",
});

text.name = "text";

const rect = new PIXI.Graphics();
rect.name = "rect";
rect.beginFill(0xff0000);
rect.drawRect(50, 50, 100, 100);
rect.endFill();
rect.alpha = 0;

scene1.name = "scene1";
scene1.addChild(rect);
scene1.addChild(text);

const scene2 = new PIXI.Container();
const text2 = new PIXI.Text("Hello World", { fill: 0xff0000 });

scene2.name = "scene2";
text2.name = "text2";
scene2.addChild(text2);

const screenplay: Screenplay = {
  scenes: [
    {
      scene: "scene1",
      directives: [
        {
          directive: "Speak",
          params: {
            targetName: "text",
            text: "哈哈哈，这是一段话段话段话段话段话段话段话",
            wordsPerMin: 888,
          },
        },
        {
          directive: "FadeIn",
          params: {
            targetName: "rect",
          },
        },
        {
          directive: "Wait",
          params: {
            duration: 2,
          },
        },
        {
          directive: "Speak",
          params: {
            targetName: "text",
            text: "这是第二句话，哈哈哈，",
            wordsPerMin: 500,
          },
        },
        {
          directive: "Hide",
          params: {
            targetName: "rect",
          },
        },
      ],
    },
    {
      scene: "scene2",
      directives: [
        {
          directive: "Speak",
          params: {
            targetName: "text2",
            text: "哈哈哈，这是第二个场景",
            wordsPerMin: 888,
          },
        },
      ],
    },
  ],
};

document.getElementById("action-compose")?.addEventListener("click", () => {
  const compositor = new Compositor({
    width: 1920,
    height: 1080,
    fps: 30,
    disableAudio: true,
  });

  director.connect(compositor);
  director.action(screenplay, [scene1, scene2]).then((res) => {
    const videoSrc = URL.createObjectURL(res);
    console.log("finish", videoSrc);
    const video = document.createElement("video");
    video.src = videoSrc;
    video.controls = true;
    document.body.append(video);
  });
});

document.getElementById("action-preview")?.addEventListener("click", () => {
  const previewer = new Previewer({
    width: 1920,
    height: 1080,
    fps: 30,
    disableAudio: true,
    canvas: document.getElementById("preview-canvas") as HTMLCanvasElement,
  });

  director.connect(previewer);
  director.action(screenplay, [scene1, scene2]);
});

document.getElementById("cut")?.addEventListener("click", () => {
  director.cut();
});
