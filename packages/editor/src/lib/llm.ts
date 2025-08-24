import OpenAI from "openai";
import { useSettingsStore } from "@/store/settings";
import { matchJSON } from "./utils";

async function requestLLM(system: string, prompt: string) {
  const urlParams = new URLSearchParams(window.location.search);
  const aiSettings = useSettingsStore.getState().ai;
  let apiKey = urlParams.get("key");
  let model = urlParams.get("model");
  let platform = urlParams.get("platform") ?? "deepseek";

  return new Promise((resolve) => {
    const json = {
      scenes: [
        {
          name: "神秘房间初现",
          background: {
            name: "老旧房间",
            state: "昏暗，中央悬挂钨丝灯",
          },
          dialogues: [
            {
              character: {
                name: "旁白",
                state: "",
              },
              line: "一个老旧的钨丝灯被黑色的电线悬在屋子中央，闪烁着昏暗的光芒。",
            },
            {
              character: {
                name: "旁白",
                state: "",
              },
              line: "静谧的气氛犹如墨汁滴入清水，正在房间内晕染蔓延。",
            },
            {
              character: {
                name: "旁白",
                state: "",
              },
              line: "房间的正中央放着一张大圆桌，看起来已经斑驳不堪，桌子中央立着一尊小小的座钟，花纹十分繁复，此刻正滴答作响。",
            },
          ],
        },
        {
          name: "沉睡的人们与山羊头",
          background: {
            name: "老旧房间",
            state: "昏暗，圆桌周围",
          },
          dialogues: [
            {
              character: {
                name: "旁白",
                state: "",
              },
              line: "围绕桌子一周，坐着十个衣着各异的人，他们的衣服看起来有些破旧，面庞也沾染了不少灰尘。",
            },
            {
              character: {
                name: "旁白",
                state: "",
              },
              line: "他们有的趴在桌面上，有的仰坐在椅子上，都沉沉的睡着。",
            },
            {
              character: {
                name: "旁白",
                state: "",
              },
              line: "在这十人的身边，静静地站着一个戴着山羊头面具、身穿黑色西服的男人。",
            },
            {
              character: {
                name: "旁白",
                state: "",
              },
              line: "他的目光从破旧的山羊头面具里穿出，饶有兴趣的盯着十个人。",
            },
          ],
        },
        {
          name: "苏醒时刻",
          background: {
            name: "老旧房间",
            state: "座钟指向十二点",
          },
          dialogues: [
            {
              character: {
                name: "旁白",
                state: "",
              },
              line: "桌上的座钟响了起来，分针与时针同时指向了『十二』。",
            },
            {
              character: {
                name: "旁白",
                state: "",
              },
              line: "房间之外很遥远的地方，传来了低沉的钟声。",
            },
            {
              character: {
                name: "旁白",
                state: "",
              },
              line: "同一时刻，围坐在圆桌旁边的十个男男女女慢慢苏醒了。",
            },
            {
              character: {
                name: "旁白",
                state: "",
              },
              line: "他们逐渐清醒之后，先是迷惘的看了看四周，又疑惑的看了看对方。",
            },
            {
              character: {
                name: "旁白",
                state: "",
              },
              line: "看来谁都不记得自己为何出现在此处。",
            },
          ],
        },
        {
          name: "山羊头的发言",
          background: {
            name: "老旧房间",
            state: "众人苏醒后面面相觑",
          },
          dialogues: [
            {
              character: {
                name: "山羊头",
                state: "平静",
              },
              line: "早安，九位。很高兴能在此与你们见面，你们已经在我面前沉睡了十二个小时了。",
            },
            {
              character: {
                name: "旁白",
                state: "",
              },
              line: "眼前这个男人的装扮实在是诡异，在昏暗的灯光下吓了众人一跳。",
            },
            {
              character: {
                name: "旁白",
                state: "",
              },
              line: "他的面具仿佛是用真正的山羊头做成的，很多毛发已经发黄变黑，打结粘在了一起。",
            },
            {
              character: {
                name: "旁白",
                state: "",
              },
              line: "山羊面具的眼睛处挖了两个空洞，露出了他那狡黠的双眼。",
            },
            {
              character: {
                name: "旁白",
                state: "",
              },
              line: "他的举手投足之间不仅散发着山羊身上独有的膻腥味，更有一股隐隐的腐烂气息。",
            },
          ],
        },
        {
          name: "花臂男的疑问",
          background: {
            name: "老旧房间",
            state: "气氛紧张",
          },
          dialogues: [
            {
              character: {
                name: "花臂男",
                state: "犹豫",
              },
              line: "你……是谁？",
            },
            {
              character: {
                name: "山羊头",
                state: "高兴",
              },
              line: "相信你们都有这个疑问，那我就跟九位介绍一下。",
            },
            {
              character: {
                name: "旁白",
                state: "",
              },
              line: "山羊头高兴的挥舞起双手，看起来他早就准备好答案了。",
            },
          ],
        },
      ],
    };
    // 在这里执行你的异步操作
    setTimeout(() => {
      resolve(json.scenes);
    }, 1000);
  });

  // 优先从 URL 参数中获取, 否则读取本地设置
  if (aiSettings && !apiKey) {
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
