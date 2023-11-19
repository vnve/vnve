<h4 align="right"><a href="https://github.com/vnve/vnve/blob/main/README.md">English</a> | <strong>简体中文</strong></h4>
<p align="center">
  <img src="https://vnve.github.io/vnve/logo.png" width=138/>
</p>
<h1 align="center">V N V E</h1>
<p align="center"><strong>visual novel video editor</strong></p>
<p align="center"><strong>视觉小说视频编辑器</strong></p>
<p align="center"><strong>在网页上制作并生成视觉小说，互动电影，GalGame类型的视频，<a href="https://vnve.github.io/vnve/">访问地址 🔗 </a></strong></p>
<div align="center">
  <img src="https://github.com/vnve/vnve/actions/workflows/static.yml/badge.svg">
</div>

## 特征

- 🎬 仅需要打开网页，就可以立刻开始视觉小说类型的视频创作
- 👋 零视频剪辑基础知识，告别烦人的视频剪辑、时间轴等操作
- 📝 文字优先，让我们回到视觉小说创作的核心 —— 文字内容
- 🚀 纯前端实现，核心通过 PixiJS + Webcodecs 驱动
> 👻 定位只是一个为视觉小说量身定制的视频创作工具，假如你想制作分支逻辑、数值等更具游戏性的行为，可以去利用类似b站的[互动视频](https://member.bilibili.com/platform/upload/video/interactive)去实现


## 网页用法
只需要访问: [vnve.github.io/vnve](https://vnve.github.io/vnve/)，就可以开始创作

## 代码用法
### 基础
#### 安装
```bash
npm install @vnve/core
```

#### 使用
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
creator.addScene(scene)
creator.start().then(videoBlob => {
  URL.createObjectURL(videoBlob) // 稍等片刻，你就可以获得一个mp4文件
})
```

### 模版
通过模版可以更快捷的把场景&元素封装到一起，实现快速使用，需要额外安装一个`@vnve/template`，

#### 安装
```bash
npm install @vnve/template
```
#### 使用
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

creator.addScene(titleScene)
creator.addScene(dialogueScene)
creator.start().then(videoBlob => {
  URL.createObjectURL(videoBlob) // 稍等片刻，你就可以获得一个mp4文件
})
```

## 多仓库
| 包名 | 简介 | 文档 |
|  ----  | ----  | ---- |
| @vnve/editor | 编辑器的web ui页面 | - |
| @vnve/core | 核心模块，利用PixiJS + Webcodes实现场景动态化，并生成视频 | [📖](https://github.com/vnve/vnve/blob/main/packages/core/README.md) |
| @vnve/template | 模版包，由场景和元素组成 | [📖](https://github.com/vnve/vnve/blob/main/packages/template/README.md) |

## 证书
MIT
