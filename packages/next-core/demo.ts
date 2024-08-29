import { Director, Screenplay } from "./src/Director/Director";
import { Compositor, Previewer } from "./src/connector";
import { Scene, Text, Graphics, Sound } from "./src";
// import bgm from "./bgm.mp3";

// const app = new PIXI.Application({
//   view: document.getElementById("canvas") as HTMLCanvasElement,
//   width: 1920,
//   height: 1080,
//   autoStart: false,
// });
const director = new Director({
  // renderer: app.renderer,
});

const scene1 = new Scene();

// 创建一个文字
const text = new Text("哈哈哈哈哈这是", {
  fill: 0xffffff,
  fontFamily: "Arial",
  fontSize: 30,
  fontWeight: "bold",
});

text.name = "text";

const rect = new Graphics();
rect.name = "rect";
rect.beginFill(0xff0000);
rect.drawRect(50, 50, 100, 100);
rect.endFill();

// const sound = new Sound({ source: bgm });

scene1.addChild(rect);
scene1.addChild(text);
// scene1.addSound(sound);

const scene2 = scene1.clone();

function genScreenplay() {
  const screenplay: Screenplay = {
    scenes: [
      {
        scene: scene1.name,
        directives: [
          {
            directive: "Wait",
            params: {
              duration: 0.1,
            },
          },
          {
            directive: "FadeIn",
            params: {
              targetName: "rect",
              sequential: true,
            },
          },
          {
            directive: "Speak",
            params: {
              targetName: "text",
              text: "哈哈哈，这是一段话段话段话段话段话段话",
              wordsPerMin: 888,
            },
          },
          {
            directive: "Speak",
            params: {
              targetName: "text",
              text: "暂停，这是一段话段话段话段话段话段话",
              wordsPerMin: 888,
            },
          },
          {
            directive: "Wait",
            params: {
              duration: 5,
            },
          },
          // {
          //   directive: "Speak",
          //   params: {
          //     targetName: "text",
          //     text: "这是增加的话",
          //     wordsPerMin: 888,
          //     append: true,
          //   },
          // },
          // {
          //   directive: "FadeIn",
          //   params: {
          //     targetName: "rect",
          //   },
          // },
          // {
          //   directive: "Wait",
          //   params: {
          //     duration: 3,
          //   },
          // },
          // {
          //   directive: "Speak",
          //   params: {
          //     targetName: "text",
          //     text: "这是第二句话，哈哈哈，",
          //     wordsPerMin: 500,
          //   },
          // },
          // {
          //   directive: "Hide",
          //   params: {
          //     targetName: "rect",
          //   },
          // },
        ],
      },
      // {
      //   scene: scene2.name,
      //   directives: [
      //     {
      //       directive: "Speak",
      //       params: {
      //         targetName: "text",
      //         text: "哈哈哈，这是第二个场景",
      //         wordsPerMin: 888,
      //       },
      //     },
      //   ],
      // },
    ],
  };

  return screenplay;
}

document
  .getElementById("action-compose")
  ?.addEventListener("click", async () => {
    await scene1.load();

    const screenplay = genScreenplay();
    const compositor = new Compositor({
      width: 1920,
      height: 1080,
      fps: 30,
      // disableAudio: true,
    });

    director.connect(compositor);
    director.action(screenplay, [scene1, scene2]).then((res) => {
      const videoSrc = URL.createObjectURL(res);
      console.log("finish", videoSrc);
      const video = document.createElement("video");
      video.src = videoSrc;
      video.width = 1920 / 2;
      video.height = 1080 / 2;
      video.controls = true;
      document.body.append(video);
    });
  });

document
  .getElementById("action-preview")
  ?.addEventListener("click", async () => {
    const screenplay = genScreenplay();
    const previewer = new Previewer({
      width: 1920,
      height: 1080,
      fps: 30,
      // disableAudio: true,
      canvas: document.getElementById("preview-canvas") as HTMLCanvasElement,
    });

    director.connect(previewer);
    director.action(screenplay, [scene1, scene2]);
  });

document.getElementById("cut")?.addEventListener("click", () => {
  director.cut();
});
