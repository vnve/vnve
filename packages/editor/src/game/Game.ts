import { DBAssetType, getAssetByName } from "@/db";
import { createSprite, parseNames } from "@/lib/core";
import { createDialogueScene, Editor, Speak } from "@vnve/core";

const mockText = `{"name": "场景", "value": "教室"}
{"name": "旁白", "value": "暴风雪呼啸，山庄外一片白茫茫。客厅里，壁炉的火焰跳跃着，试图驱散寒意，但空气中仍然弥漫着一种无法言喻的紧张感。"}
{"name": "男主", "value": "侦探先生，这场暴风雪看来一时半会儿停不了，我们恐怕要在这里过夜了。"}
{"name": "女主", "value": "哼！在自己的山庄里过夜又如何？倒是你们，最好安分点！"}
`;

function mockStream(text: string) {
  const stream = new ReadableStream({
    start(controller) {
      let pos = 0;
      const timer = setInterval(() => {
        if (pos < text.length) {
          controller.enqueue(text[pos]);
          pos++;
        } else {
          controller.close();
          clearInterval(timer);
        }
      }, 50);
    },
  });

  return stream;
}

class Timeline {
  private queue: Array<{
    fn: () => void;
    start: number;
    duration: number;
  }> = [];
  private start = 0; // 开始时间
  private frameId: number | null = null;

  public add(fn: () => void, duration: number) {
    let start = 0;

    if (this.queue.length > 0) {
      start =
        this.queue[this.queue.length - 1].start +
        this.queue[this.queue.length - 1].duration;
    }

    this.queue.push({
      fn,
      start,
      duration,
    });
  }

  public play(timestamp: number) {
    if (!this.start) {
      this.start = timestamp;
    }

    const elapsed = (timestamp - this.start) / 1000;

    // 从队列中找出当前时间点需要执行的指令
    // TODO: 执行时机问题

    this.frameId = requestAnimationFrame(this.play.bind(this));
  }

  public stop() {
    this.start = 0;
    if (this.frameId) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }
  }
}

interface ILine {
  name: string;
  value: string;
}

export class Game {
  public editor: Editor;
  /**
   * 剧本
   */
  public screenplay: string;
  /**
   * 大模型预设提示词
   */
  public preset: string;

  private directiveTimeline: Timeline;

  constructor({ view }: { view: HTMLCanvasElement }) {
    this.editor = new Editor({ view });
    this.screenplay = "";
    this.preset = "";
  }

  public updateScreenplay(str: string) {
    this.screenplay = str
  }
  
  public updatePreset(str: string) {
    this.preset = str
  }

  public play(nextAction: string) {
    // 1. 输入下一步操作
    // 2. 请求大模型接口
    // 3. 解析返回结果，画布展示
    // 4. 储存剧本
    this.parseLLMResponse();
  }

  public exportScenes() {
    // 把剧本转换成场景
  }

  private requestLLM() {
    // 请求大模型
  }

  private async parseLLMResponse() {
    // 解析大模型返回值，实时展示在画布上
    const stream = mockStream(mockText) as any;
    let output = "";

    // 从stream中进行匹配，匹配到指定的内容就进行输出
    for await (const chunk of stream) {
      output += chunk;

      // JSONL格式以换行分隔
      if (output.endsWith("\n")) {
        const line = JSON.parse(output);
        // TODO： 控制执行队列速度，需要等上一个任务执行完
        this.execLine(line);
        output = "";
      }
    }

    // 如果文本末尾没有换行符，会还存在未解析内容，最后再解析一次
    if (output) {
      const line = JSON.parse(output);
      this.execLine(line);
    }
  }

  /**
   * 执行单行命令
   */
  private async execLine(line: ILine) {
    const { name, value } = line;

    if (name === "场景") {
      // 切换场景
      const scene = createDialogueScene();
      scene.label = value;

      this.editor.addScene(scene);
      this.editor.setActiveScene(scene);

      const { name, stateName } = parseNames(value);
      const asset = await getAssetByName(
        name,
        stateName,
        DBAssetType.Background,
      );
      const background = await createSprite(asset, this.editor);
      this.editor.addChild(background);
    } else if (name === "旁白") {
      // 旁白发言
      const speak = new Speak(
        {
          targetName: this.editor.activeScene.config.speak.targetName,
          text: value,
          speaker: {
            targetName: this.editor.activeScene.config.speak.speaker.targetName,
            name: "",
          },
        },
        this.editor.app.stage,
      );
      speak.execute();
    } else {
      // 角色发言
      new Speak(
        {
          targetName: this.editor.activeScene.config.speak.targetName,
          text: value,
          speaker: {
            targetName: this.editor.activeScene.config.speak.speaker.targetName,
            name,
          },
        },
        this.editor.app.stage,
      ).execute();
    }
  }
}
