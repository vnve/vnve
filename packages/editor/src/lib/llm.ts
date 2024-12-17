import { Editor } from "@vnve/core";
import { text2Scenes } from "./core";

function requestLLM(prompt: string) {
  return Promise.resolve(`标题
第一幕 遇见

场景
学校

旁白
这是一句旁白

男主
这是一句台词

女主
这是女主的台词`);
}

export async function convert2Scenes(input: string, editor: Editor) {
  const prompt = `请严格参考下面的格式:
\`\`\`
标题
{场景标题}

场景
{场景名称}

旁白
{旁白内容}

{角色名}
{角色台词}

\`\`\`
示例：
\`\`\`
标题
第一幕

场景
密室

旁白
旁白内容

男主
男主的台词

女主
女主的台词
\`\`\`

把这段故事：${input}

改编成一个中文视觉小说剧本。所有角色名请使用中文，剧本内容应包括详细的场景描述、旁白以及角色的台词。`;
  const text = await requestLLM(prompt);

  return text2Scenes(text, editor);
}

export async function genScenes(input: string, editor: Editor) {
  const prompt = `请严格参考下面的格式:
\`\`\`
标题
{场景标题}

场景
{场景名称}

旁白
{旁白内容}

{角色名}
{角色台词}

\`\`\`
示例：
\`\`\`
标题
第一幕

场景
密室

旁白
旁白内容

男主
男主的台词

女主
女主的台词
\`\`\`

编写一个中文视觉小说剧本，剧情大纲是${input}。所有角色名请使用中文，剧本内容应包括详细的场景描述、旁白以及角色的台词。`;

  const text = await requestLLM(prompt);

  return text2Scenes(text, editor);
}
