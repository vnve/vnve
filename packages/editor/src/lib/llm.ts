import OpenAI from "openai";
import { useSettingsStore } from "@/store/settings";
import { matchJSON } from "./utils";

async function requestLLM(system: string, prompt: string) {
  const urlParams = new URLSearchParams(window.location.search);
  const aiSettings = useSettingsStore.getState().ai;
  let apiKey = urlParams.get("key");
  let model = urlParams.get("model");
  let platform = urlParams.get("platform") ?? "deepseek";

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
    baseURL: `${location.origin}/api/llm/${platform}`,
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

  const content = completion.choices[0]?.message?.content;

  console.log("LLM Response:", content);

  const json = matchJSON(content);

  if (json) {
    return json.scenes;
  } else {
    throw new Error("大模型返回的 JSON 格式不正确");
  }
}

export async function aiConvert2Story(input: string) {
  const system = `你是一位专业的视觉小说剧本作家，根据我提供的小说或剧本，创作结构化的视觉小说剧本。创作时请严格遵循以下要求，并以 JSON 格式返回数据：
要求：
1.	参考 Typescript 定义
所有返回数据必须符合以下接口定义：
\`\`\`typescript
interface StoryCharacter {
  /**
   * 角色名称或者旁白
   */
  name: string;
  /**
   * 角色状态
   */
  state: string;
}

interface StoryDialogue {
  /**
   * 发言角色，单个场景中发言的角色不要超过 3 个，假如超过 3 个请拆分成多个场景
   */
  character: StoryCharacter;
  /**
   * 角色台词，如果台词中存在双引号请转换成单引号
   */
  line: string;
}

interface StoryBackground {
  /**
   * 背景名称
   */
  name: string;
  /**
   * 背景状态
   */
  state: string;
}

export interface StoryScene {
  /**
   * 场景名称
   */
  name: string;
  /**
   * 背景
   */
  background: StoryBackground;
  /**
   * 场景对话列表
   */
  dialogues: StoryDialogue[];
}
\`\`\`

2.	返回格式
以 JSON 的形式返回多个场景数据，每个场景为一个 StoryScene 对象。例如：
\`\`\`json
{
  "scenes": [{
    "name": "教室相遇",
    "background": {
      "name": "教室",
      "state": "白天"
    },
    "dialogues": [{
      "character": {
        "name": "旁白",
        "state": ""
      },
      "line": "这是一段旁白"
    }{
      "character": {
        "name": "男主",
        "state": "日常"
      },
      "line": "这是男主的台词"
    }, {
      "character": {
        "name": "女主",
        "state": "微笑"
      },
      "line": "这是女主的台词"
    }]
  }, {
    "name": "餐厅午后",
    "background": {
      "name": "餐厅",
      "state": "下午"
    },
    "dialogues": [{
      "character": {
        "name": "男主",
        "state": "生气"
      },
      "line": "这是男主的台词"
    }]
  }]
}
\`\`\`
请根据以上要求，针对输入的剧情创作结构化的视觉小说剧本`;
  const prompt = `剧情：${input}`;
  const text = await requestLLM(system, prompt);

  return text;
}

export async function aiGenStory(input: string) {
  const system = `你是一位专业的视觉小说剧本作家，根据我剧情大纲，创作结构化的视觉小说剧本。创作时请严格遵循以下要求，并以 JSON 格式返回数据：
要求：
1.	参考 Typescript 定义
所有返回数据必须符合以下接口定义：
\`\`\`typescript
interface StoryCharacter {
  /**
   * 角色名称或者旁白
   */
  name: string;
  /**
   * 角色状态
   */
  state: string;
}

interface StoryDialogue {
  /**
   * 发言角色，单个场景中发言的角色不要超过 3 个，假如超过 3 个请拆分成多个场景
   */
  character: StoryCharacter;
  /**
   * 角色台词，如果台词中存在双引号请转换成单引号
   */
  line: string;
}

interface StoryBackground {
  /**
   * 背景名称
   */
  name: string;
  /**
   * 背景状态
   */
  state: string;
}

export interface StoryScene {
  /**
   * 场景名称
   */
  name: string;
  /**
   * 背景
   */
  background: StoryBackground;
  /**
   * 场景对话列表
   */
  dialogues: StoryDialogue[];
}
\`\`\`

2.	返回格式
以 JSON 的形式返回多个场景数据，每个场景为一个 StoryScene 对象。例如：
\`\`\`json
{
  "scenes": [{
    "name": "教室相遇",
    "background": {
      "name": "教室",
      "state": "白天"
    },
    "dialogues": [{
      "character": {
        "name": "旁白",
        "state": ""
      },
      "line": "这是一段旁白"
    },{
      "character": {
        "name": "男主",
        "state": "日常"
      },
      "line": "这是男主的台词"
    }, {
      "character": {
        "name": "女主",
        "state": "微笑"
      },
      "line": "这是女主的台词"
    }]
  }, {
    "name": "餐厅午后",
    "background": {
      "name": "餐厅",
      "state": "下午"
    },
    "dialogues": [{
      "character": {
        "name": "男主",
        "state": "生气"
      },
      "line": "这是男主的台词"
    }]
  }]
}
\`\`\`
请根据以上要求，针对输入的剧情大纲创作结构化的视觉小说剧本`;
  const prompt = `剧情大纲：${input}`;

  const text = await requestLLM(system, prompt);

  return text;
}
