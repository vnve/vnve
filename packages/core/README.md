## Purpose
Use PixiJS + WebCodecs to create mp4 videos in browser.

> You can view the browser's online editor at: [vnve](https://github.com/vnve/vnve)

## Install
```bash
npm install @vnve/core
```

## Usage
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

## Use with template
[Template Usage](https://github.com/vnve/vnve/blob/main/packages/template/README.md)

## API
If you've used PixiJS, you can get started quickly. This package is a simple layer of encapsulation for PixiJS objects, providing some additional methods and properties. You can think of Text, Img, and Graphics as Text, Sprite, and Graphics in PixiJS to modify their properties.


TODO: detail api
