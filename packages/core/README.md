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
text.addAnimation(PREST_ANIMATION.FadeIn)

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
If you've used PixiJS, you can get started quickly. This package is a simple layer of encapsulation for PixiJS objects, providing some additional methods and properties.

### Creator
``` typescript
// options
const creator = new Creator({
  width: 1920, // video width, default is 1920
  heigh: 1080, // video height, default is 1080
  fps: 30, // video fps, default is 30
  background: '"#000000"', // video background, default is "#000000"
  onlyVideo: false, // only encode video, without audio default is false
})

// progress callback
creator.onProgress = (percent: number) => {
  console.log('video create progress:', percent)
}

// supported methods
creator.add(scene) // add scene to creator
creator.remove(scene) // remove scene from creator
creator.load(scene[]) // load scenes, will replace creator current scenes
creator.start() // start to create video
creator.stop() // stop creating
```

### Scene
Scene is extends from `PIXI.Container`, you can use all the properties and call all the methods in [`PIXI.Container`](https://pixijs.download/dev/docs/PIXI.Container.html)

``` typescript
// options
const scene = new Scene({
  duration: 3000 // scene duration, default is 0
})

// extends methods
scene.addChild(Text | Img | Graphics) // add child element to scene canvas
scene.removeChild() // remove child from scene canvas
scene.addSound(Sound) // add sound to scene
scene.removeSound(Sound) // remove sound from scene
scene.addTransition(Transition) // add transition to scene
scene.removeTransition(Transition) // remove transition from scene
```

### Child
Elements that can be added to the scene

#### Text
Text is extends from `PIXI.Text`, you can use all the properties and call all the methods in [`PIXI.Text`](https://pixijs.download/dev/docs/PIXI.Text.html)
``` typescript
const text = new Text('This is a PixiJS text', {
  fontFamily: 'Arial',
  fontSize: 24,
  fill: 0xff1010,
  align: 'center',
});
```

#### Img
Img is extends from `PIXI.Sprite`, you can use all the properties and call all the methods in [`PIXI.Sprite`](https://pixijs.download/dev/docs/PIXI.Sprite.html).
For convenience, we have modified the initialization parameters. Now, you only need to pass the image URL to the `source` parameter to complete the creation.

``` typescript
const img = new Img({
  source: 'img url'
});
```

#### Graphics
Img is extends from `PIXI.Graphics`, you can use all the properties and call all the methods in [`PIXI.Graphics`](https://pixijs.download/dev/docs/PIXI.Graphics.html).
``` typescript
const dialogRect = new Graphics()

dialogRect.x = 100;
dialogRect.y = 100;

dialogRect.beginFill(0x000000);
dialogRect.drawRect(0, 0, 100, 100);
dialogRect.endFill();
```

#### Sound
``` typescript
// options
const sound = new Sound({
  source: 'sound url'
})

sound.start = 1000 // set start time, default is 0
sound.duration = 1000 // set duration, default is audio buffer duration
sound.volume = 0.5 // set volume, default is 1
sound.loop = true // set loop, default is false
```
### Animation
We use [GSAP](https://github.com/greensock/GSAP) to implement the animation effect

`addAnimation` params is `[fromVars, toVars]`, same as [`GSAP.fromTo`](https://gsap.com/docs/v3/GSAP/gsap.fromTo())

``` typescript
const text = new Text('Animated Text') // Img | Graphics can also add animation

text.addAnimation([fromVars, toVars]) // same as GSAP.fromTo

// you can also use preset animation
text.addAnimation(PREST_ANIMATION.FadeIn)

```

## Browser Support
Default browser support baseline is [WebCodecs](https://caniuse.com/webcodecs) and [OfflineAudioContext](https://caniuse.com/mdn-api_offlineaudiocontext), you can use `isEnvSupported` method to determine if the environment supports.


