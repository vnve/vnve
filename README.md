<h4 align="right"><strong>English</strong> | <a href="https://github.com/vnve/vnve/blob/main/README_CN.md">简体中文</a></h4>
<p align="center">
  <img src="https://vnve.github.io/vnve/logo.png" width=138/>
</p>
<h1 align="center">V N V E</h1>
<p align="center"><strong>Visual Novel Video Editor</strong></p>
<p align="center"><strong>Browser-based online creation of videos in the Visual Novel/Interactive Movie/GalGame genres <a href="https://vnve.github.io/vnve/">link: 🔗 </a></strong></p>
<div align="center">
  <a href="https://discord.gg/sc9jpqBAbs"><img src="https://img.shields.io/badge/chat-discord-blue?style=flat&logo=discord" alt="discord chat"></a>
  <a href="https://www.npmjs.com/package/@vnve/core"><img src="https://img.shields.io/npm/dm/%40vnve/core" alt="downloads"></a>
  <img src="https://github.com/vnve/vnve/actions/workflows/eslint.yml/badge.svg" alt="eslint">
  <img src="https://img.shields.io/github/commit-activity/m/vnve/vnve" alt="commit">
  <img src="https://github.com/vnve/vnve/actions/workflows/static.yml/badge.svg" alt="static">
</div>

## Features

- 🎬 An online video editor customized for creating visual novels, open your browser and start creating!
- 👋 Say goodbye to complicated video editing software and create visual novel videos easily and quickly!
- 📝 Prioritizing text brings us back to the heart of visual novel creation -- textual content
- 🚀 Pure front-end Typescript implementation, the core is driven by PixiJS + Webcodecs.
- 🖍️ You can also create videos programmatically by using the npm package
> 👻 Positioning is just a video creation tool tailored for visual novels, if you want to create branching logic, numerical values and other more game-like behavior, you can go to use bilibili [interactive video](https://member.bilibili.com/platform/upload/video/interactive)

## Created with VNVE
<table>
<tr>
<td align="center">
<img style="width: 360px" src="demo/titleScene.gif" />
<p>Video title scene</p>
<td align="center">
<img style="width: 360px" src="demo/dialogueScene.gif" />
<p>Character dialog scenes</p>
</td>
</tr>
</table>

## Online Usage
visit: [vnve.github.io/vnve](https://vnve.github.io/vnve/), start creating video immediately.

### Demo
https://github.com/vnve/vnve/assets/14970577/b7b78ea4-9695-430c-b401-898065c31940

## Code Usage
You can also create videos directly by calling the npm package

### Install
```bash
npm install @vnve/core
```

### Usage
```typescript
import { Creator, Scene, Img, Text, Sound, PREST_ANIMATION } from "@vnve/core";

// Init creator
const creator = new Creator();

// Scene, the video is made up of a combination of scenes
const scene = new Scene({ duration: 3000 })

// Create some elements
const img = new Img({ source: "img url" })
const text = new Text("V N V E", {
  fill: "#ffffff",
  fontSize: 200
})
const sound = new Sound({ source: "sound url" })

// Adding elements to the scene
scene.addChild(img)
scene.addChild(text)
scene.addChild(sound)

// You can add some animation to the element
text.addAnimation(PREST_ANIMATION.FADE_IN)

// Provide the scene to the creator and start generating the video
creator.add(scene)
creator.start().then(videoBlob => {
  URL.createObjectURL(videoBlob) // Wait a few moments and you'll get an mp4 file
})
```
[![Open in CodeSandbox](https://img.shields.io/badge/Open%20in-CodeSandbox-blue?style=flat-square&logo=codesandbox)](https://codesandbox.io/s/make-video-programmatically-with-vnve-27z2cv)

### Template
By using pre-packaged templates, we can achieve the desired video effects more efficiently.

It is necessary to install an additional package `@vnve/template`

```bash
npm install @vnve/template
```

### Template Usage
```typescript
import { Creator } from "@vnve/core";
import { TitleScene, DialogueScene } from "@vnve/template";

const creator = new Creator();
// Create a title scene
const titleScene = new TitleScene({
  title: "V N V E",
  subtitle: "Make video programmatically",
  backgroundImgSource: "img url",
  soundSources: [{ source: "sound url" }],
  duration: 3000,
})

// Create a dialog scene
const dialogueScene = new DialogueScene({
  lines: [
    {
      name: "Character A",
      content: "Charater A says..."
    },
    {
      name: "Character B",
      content: "Charater B says..."
    }
  ],
  backgroundImgSource: "img url",
  soundSources: [{ source: "sound url" }],
});

// Add scenes
creator.add(titleScene)
creator.add(dialogueScene)

// Start creating videos
creator.start().then(videoBlob => {
  URL.createObjectURL(videoBlob)  // Wait a few moments and you'll get an mp4 file
})
```
[![Open in CodeSandbox](https://img.shields.io/badge/Open%20in-CodeSandbox-blue?style=flat-square&logo=codesandbox)](https://codesandbox.io/s/make-video-programmatically-with-vnve-template-4j467p)

## Core Packages
| 包名 | 简介 | 文档 |
|  ----  | ----  | ---- |
| @vnve/editor | Web UI page for the online editor | - |
| @vnve/core | Core module, using PixiJS + Webcodes to achieve scene dynamization and export Mp4 video | [📖](https://github.com/vnve/vnve/blob/main/packages/core/README.md) |
| @vnve/template | Template package, consisting of scenarios and elements for scenario reuse | [📖](https://github.com/vnve/vnve/blob/main/packages/template/README.md) |

## License
MIT
