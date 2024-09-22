import {
  Compositor,
  Previewer,
  Editor,
  Director,
  Screenplay,
  Scene,
  Text,
  Graphics,
  Sound,
  Sprite,
  createDialogueScene,
} from "./src";

const editor = new Editor({
  view: document.getElementById("canvas") as HTMLCanvasElement,
  width: 1920,
  height: 1080,
});

// const app = new PIXI.Application({
//   view: document.getElementById("canvas") as HTMLCanvasElement,
//   width: 1920,
//   height: 1080,
//   autoStart: false,
// });
const director = new Director({
  // renderer: app.renderer,
  background: 0xcccccc,
});

const scene1 = createDialogueScene();
const sprite = new Sprite({ source: img2 });
const text = new Text("123123123123", {
  fontSize: 100,
  fill: 0xffffff,
});
const sprite2 = new Sprite({ source: img });

sprite2.width = 100;
sprite2.height = 100;
sprite2.x = 1000;

scene1.addChild(text);
scene1.addChild(sprite);
scene1.addChild(sprite2);

scene1.dialogues = [] || [
  {
    speaker: {
      label: "speaker1",
      name: sprite.name,
    },
    lines: [
      {
        type: "p",
        children: [
          // {
          //   type: "directive",
          //   directive: "FadeInTransition",
          //   params: {
          //     targetName: sprite.name,
          //   },
          // },
          {
            text: "123123 哈哈哈哈哈哈哈",
          },
          {
            text: "12313123123123",
          },
        ],
      },
      {
        type: "p",
        children: [
          {
            text: "这事第二 ",
          },
          {
            type: "directive",
            directive: "AddFilter",
            params: {
              targetName: sprite.name,
              filterName: "OldFilmFilter",
              // source: img,
            },
          },
          {
            text: "这事第二这事第二这事第二这事第二",
          },
          {
            type: "directive",
            directive: "RemoveFilter",
            params: {
              targetName: sprite.name,
              filterName: "OldFilmFilter",
              // source: img,
            },
          },
          {
            text: "这事第二这事第二这事第二这事第二",
          },
        ],
      },
    ],
  },
  {
    speaker: {
      label: "speaker2",
      name: sprite2.name,
    },
    lines: [
      {
        type: "p",
        children: [
          // {
          //   type: "directive",
          //   directive: "FadeInTransition",
          //   params: {
          //     targetName: sprite.name,
          //   },
          // },
          {
            text: "123123 哈哈哈哈哈哈哈",
          },
          {
            text: "12313123123123",
          },
        ],
      },
      {
        type: "p",
        children: [
          {
            text: "这事第二 ",
          },
          {
            type: "directive",
            directive: "AddFilter",
            params: {
              targetName: sprite.name,
              filterName: "OldFilmFilter",
              // source: img,
            },
          },
          {
            text: "这事第二这事第二这事第二这事第二",
          },
          // {
          //   type: "directive",
          //   directive: "RemoveFilter",
          //   params: {
          //     targetName: sprite.name,
          //     filterName: "OldFilmFilter",
          //     // source: img,
          //   },
          // },
          {
            text: "这事第二这事第二这事第二这事第二",
          },
        ],
      },
    ],
  },
];

editor.loadScenes([scene1]);
editor.setActiveScene(scene1);

document.getElementById("up")?.addEventListener("click", () => {
  editor.moveUpChild();
});
document.getElementById("down")?.addEventListener("click", () => {
  editor.moveDownChild();
});
document.getElementById("top")?.addEventListener("click", () => {
  editor.moveChildToTop();
});
document.getElementById("bottom")?.addEventListener("click", () => {
  editor.moveChildToBottom();
});

document
  .getElementById("action-compose")
  ?.addEventListener("click", async () => {
    const screenplay = await editor.exportScreenplay();
    const compositor = new Compositor({
      width: 1920,
      height: 1080,
      fps: 30,
      // disableAudio: true,
    });

    director.connect(compositor);
    director.action(screenplay).then((res) => {
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
    const screenplay = await editor.exportScreenplay();
    const previewer = new Previewer({
      width: 1920,
      height: 1080,
      fps: 30,
      // disableAudio: true,
      canvas: document.getElementById("preview-canvas") as HTMLCanvasElement,
    });

    director.connect(previewer);
    director.action(screenplay);
  });

document.getElementById("cut")?.addEventListener("click", () => {
  director.cut();
});
