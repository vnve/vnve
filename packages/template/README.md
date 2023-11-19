## 安装
```bash
npm install @vnve/template
```
## 使用
```typescript
import { Creator } from "@vnve/core";
import { TitleScene, DialogueScene } from "@vnve/template";

const creator = new Creator();
// 创建一个标题场景
const titleScene = new TitleScene({
  title: "主标题",
  subtitle: "副标题",
  backgroundImgSource: "图片链接",
  soundSources: [{ source: "音频链接" }],
  duration: 4000,
})

// 创建一个对话场景
const dialogueScene = new DialogueScene({
  lines: [
    { name: "角色A", content: "角色A的台词" },
    { name: "角色B", content: "角色B的台词" },
  ],
  backgroundImgSource: "图片链接",
  soundSources: [{ source: "音频链接" }],
});

creator.add(titleScene)
creator.add(dialogueScene)
creator.start().then(videoBlob => {
  URL.createObjectURL(videoBlob) // 稍等片刻，你就可以获得一个mp4文件
})
```
