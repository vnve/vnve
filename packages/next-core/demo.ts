import * as PIXI from "pixi.js";
import gsap from "gsap";
import { PixiPlugin } from "gsap/PixiPlugin";
import { Director, Screenplay } from "./src/Director/Director";
import { Compositor } from "./src/connector";

// register the plugin
gsap.registerPlugin(PixiPlugin);

// give the plugin a reference to the PIXI object
PixiPlugin.registerPIXI(PIXI);

//unhooks the GSAP ticker
gsap.ticker.remove(gsap.updateRoot);

const app = new PIXI.Application({
  view: document.getElementById("canvas") as HTMLCanvasElement,
  width: 1920,
  height: 1080,
  autoStart: false,
});
const director = new Director({
  renderer: app.renderer,
});

const scene1 = new PIXI.Container();

// 创建一个文字
const text = new PIXI.Text("Hello World", { fill: 0xff0000 });

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

// const tl = gsap.timeline(); // 一个场景一个timeline，然后往上添加？

// tl.to(rect, { x: 100, duration: 1, ease: "linear" });
// tl.to(rect, { y: 100, duration: 1, ease: "linear" });
// tl.to(rect, { pixi: { fillColor: 0xffffff }, duration: 1, ease: "linear" }, 0);

// let i = 0;

// const ticker = PIXI.Ticker.shared;

// // 每帧更新
// ticker.autoStart = false;
// ticker.stop();

// ticker.add((t) => {
//   gsap.updateRoot(ticker.lastTime / 1000);
//   app.render();
// });

document.getElementById("btn")?.addEventListener("click", () => {
  const compositor = new Compositor({
    width: 1920,
    height: 1080,
    fps: 30,
    videoOnly: true,
  });

  director.connect(compositor);
  director.action(screenplay, [scene1, scene2]).then((res) => {
    console.log("finish", URL.createObjectURL(res));
  });
});
