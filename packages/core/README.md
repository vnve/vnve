## 安装
```bash
npm install @vnve/core
```

## 使用
```typescript
import { Creator, Scene, Img, Text, Sound, PREST_ANIMATION } from "@vnve/core";

const creator = new Creator(); // 创作者，负责视频合成

// 场景，视频是由一个个场景组合而成
const scene = new Scene({ duration: 3000 })

// 场景中的元素，文字、图片等
const img = new Img({ source: 'url' })
const text = new Text('V N V E')
const sound = new Sound({ source: 'url' })

// 把元素加到场景中
scene.addChild(img)
scene.addChild(text)
scene.addChild(sound)

// 可以给元素加些动画
text.addAnimation(PREST_ANIMATION.FADE_IN)

// 把场景提供给创作者，然后开始生成视频
creator.add(scene)
creator.start().then(videoBlob => {
  URL.createObjectURL(videoBlob) // 稍等片刻，你就可以获得一个mp4文件
})
```
