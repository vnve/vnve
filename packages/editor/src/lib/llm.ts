import { Editor } from "@vnve/core";
import { text2Scenes } from "./core";
import OpenAI from "openai";
import { DBAssetType, getAllAssetNamesByType } from "@/db";
import { useSettingsStore } from "@/store/settings";

async function getCharactersAndBackgrounds() {
  const characters = (await getAllAssetNamesByType(DBAssetType.Character)).join(
    "、",
  );
  const backgrounds = (
    await getAllAssetNamesByType(DBAssetType.Background)
  ).join("、");

  return {
    characters,
    backgrounds,
  };
}

async function requestLLM(system: string, prompt: string) {
  const urlParams = new URLSearchParams(window.location.search);
  const aiSettings = useSettingsStore.getState().ai;
  let apiKey = urlParams.get("key");
  let model = urlParams.get("model");
  let platform = urlParams.get("platform") ?? "ark";

  // 优先从 URL 参数中获取, 否则读取本地设置
  if (!apiKey) {
    apiKey = aiSettings.key;
    model = aiSettings.model;
    platform = aiSettings.platform;
  }

  if (!apiKey || !model || !platform) {
    throw new Error("请先在设置中启用 AI 配置！");
  }

  const client = new OpenAI({
    apiKey,
    baseURL: `${location.origin}/api/${platform}`,
    dangerouslyAllowBrowser: true,
  });

  const completion = await client.chat.completions.create({
    messages: [
      {
        role: "system",
        content: system,
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    model,
  });

  let content = completion.choices[0]?.message?.content;

  console.log(content);

  // 去除掉头尾的```
  if (content) {
    content = content.replace(/^```[\r\n]?|```[\r\n]?$/g, "");
  }

  return content;
}

export async function convert2Scenes(input: string, editor: Editor) {
  const { characters, backgrounds } = await getCharactersAndBackgrounds();
  const system = `请你扮演一位专业的视觉小说剧本作家，将我提供的故事原文改编为符合视觉小说格式的剧本。改编时请注意以下几点要求：

1. 角色名：所有角色名必须使用中文，不得使用任何其他语言或符号。请确保所有角色名只能是以下列表中的名字：${characters}。不要使用其他名字。
2. 场景：请确保所有场景只能是在以下列表中的：${backgrounds}。不要使用其他场景。
3. 内容结构：剧本内容必须包括详细的场景描述、旁白以及角色台词，且必须严格遵循以下的输出格式：
\`\`\`
场景
{场景名称}

旁白
{详细的旁白内容，尽可能营造氛围并推动剧情发展。}

{角色名}
{角色的台词内容，需符合角色的性格与当前情景。}

\`\`\`
4. 格式规范：输出格式必须与示例完全一致，不得增加或减少任何多余的符号、空行或内容。
5. 语言风格：剧本语言需具有叙事性和文学性，旁白需渲染场景氛围，台词需贴合角色个性。

以下是输出格式示例：
示例：
\`\`\`
场景
密室

旁白
旁白内容

男主
男主的台词

女主
女主的台词
\`\`\`
请根据以上要求，将以下故事原文改编为视觉小说剧本：`;
  const prompt = `故事原文：${input}`;
  const text = await requestLLM(system, prompt);

  return text2Scenes(text, editor, true);
}

export async function genScenes(input: string, editor: Editor) {
  const { characters, backgrounds } = await getCharactersAndBackgrounds();
  const system = `请你扮演一位专业的视觉小说剧本作家，根据我提供的剧情大纲创作视觉小说剧本。创作时请注意以下几点要求：

1. 角色名：所有角色名必须使用中文，不得使用任何其他语言或符号。请确保所有角色名只能是以下列表中的名字：${characters}。不要使用其他名字。
2. 场景：请确保所有场景只能是在以下列表中的：${backgrounds}。不要使用其他场景。
3. 内容结构：剧本内容必须包括详细的场景描述、旁白以及角色台词，且必须严格遵循以下的输出格式：
\`\`\`
场景
{场景名称}

旁白
{详细的旁白内容，尽可能营造氛围并推动剧情发展。}

{角色名}
{角色的台词内容，需符合角色的性格与当前情景。}

\`\`\`
4. 格式规范：输出格式必须与示例完全一致，不得增加或减少任何多余的符号、空行或内容。
5. 语言风格：剧本语言需具有叙事性和文学性，旁白需渲染场景氛围，台词需贴合角色个性。

以下是输出格式示例：
示例：
\`\`\`
场景
密室

旁白
旁白内容

男主
男主的台词

女主
女主的台词
\`\`\`
请根据以上要求，按照以下剧情大纲创作视觉小说剧本：`;
  const prompt = `剧情大纲是：${input}`;

  const text = await requestLLM(system, prompt);

  return text2Scenes(text, editor, true);
}
