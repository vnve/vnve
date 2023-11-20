## Install
```bash
npm install @vnve/core @vnve/template
```

## Usage
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
