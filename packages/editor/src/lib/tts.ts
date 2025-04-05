interface SynthesisParams {
  token: string;
  appid: string;
  text: string;
  voiceType: string;
  resourceId?: string;
  volume?: number;
  speed?: number;
  pitch?: number;
}

interface SynthesisTaskResponse {
  task_status: number;
  task_id: string;
  message: string;
}

interface SynthesisResult {
  audio_url: string;
  task_status: number;
}

export async function longTextSynthesis(
  params: SynthesisParams,
): Promise<SynthesisResult> {
  const {
    text,
    voiceType,
    volume,
    speed,
    pitch,
    token,
    appid,
    resourceId = "volc.tts_async.default",
  } = params;
  const timeoutDuration = 5 * 60 * 1000;
  const startTime = Date.now();
  const createTaskResponse = await createSynthesisTask({
    text,
    voiceType,
    volume,
    speed,
    pitch,
    token,
    appid,
    resourceId,
  });

  if (!createTaskResponse.task_id) {
    throw new Error(
      `创建合成任务失败，错误信息: ${createTaskResponse.message}`,
    );
  }

  if (createTaskResponse.task_status === 2) {
    throw new Error(
      `创建合成任务失败，错误信息: ${JSON.stringify(createTaskResponse)}`,
    );
  }
  const taskId = createTaskResponse.task_id;
  let result: SynthesisResult;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    if (Date.now() - startTime > timeoutDuration) {
      throw new Error("合成任务超时，请检查服务状态。");
    }
    const queryResponse = await querySynthesisResult({
      taskId,
      token,
      appid,
      resourceId,
    });
    if (queryResponse.task_status === 1) {
      result = queryResponse;
      break;
    } else if (queryResponse.task_status === 2) {
      throw new Error(
        `合成任务失败，错误信息: ${JSON.stringify(queryResponse)}`,
      );
    } else {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
  return result;
}

function genUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

async function createSynthesisTask(
  params: SynthesisParams,
): Promise<SynthesisTaskResponse> {
  const { text, voiceType, volume, speed, pitch, token, appid, resourceId } =
    params;
  const apiUrlMap: Record<string, string> = {
    "volc.tts_async.default": "/api/tts/ark/api/v1/tts_async/submit",
    "volc.tts_async.emotion":
      "/api/tts/ark/api/v1/tts_async_with_emotion/submit",
  };
  const apiUrl = apiUrlMap[resourceId];
  const reqid = genUUID();
  const format = "mp3";

  const headers = {
    "Content-Type": "application/json",
    "Resource-Id": resourceId,
    Authorization: `Bearer; ${token}`,
  };

  const requestData = {
    appid,
    reqid,
    text,
    format,
    voice_type: voiceType,
    volume,
    speed,
    pitch,
  };

  const response = await fetch(apiUrl, {
    method: "POST",
    headers,
    body: JSON.stringify(requestData),
  });
  const data: SynthesisTaskResponse = await response.json();
  return data;
}

async function querySynthesisResult(params: {
  taskId: string;
  token: string;
  appid: string;
  resourceId: string;
}): Promise<SynthesisResult> {
  const { taskId, token, appid, resourceId } = params;
  const apiUrlMap: { [key: string]: string } = {
    "volc.tts_async.default": "/api/tts/ark/api/v1/tts_async/query",
    "volc.tts_async.emotion":
      "/api/tts/ark/api/v1/tts_async_with_emotion/query",
  };
  const apiUrl = apiUrlMap[resourceId];
  const queryParams = `appid=${appid}&task_id=${taskId}`;

  const headers = {
    "Resource-Id": resourceId,
    Authorization: `Bearer; ${token}`,
  };

  const response = await fetch(`${apiUrl}?${queryParams}`, {
    method: "GET",
    headers,
  });
  const data: SynthesisResult = await response.json();
  return data;
}

export const NONE_VOICE = "NONE_VOICE";

// https://www.volcengine.com/docs/6561/97465#%E4%B8%AD%E6%96%87
export const VOICE_OPTIONS = [
  { name: "无", value: NONE_VOICE },
  { name: "灿灿 2.0", value: "BV700_V2_streaming" },
  { name: "炀炀", value: "BV705_streaming" },
  { name: "擎苍 2.0", value: "BV701_V2_streaming" },
  { name: "通用女声 2.0", value: "BV001_V2_streaming" },
  { name: "灿灿", value: "BV700_streaming" },
  { name: "超自然音色-梓梓2.0", value: "BV406_V2_streaming" },
  { name: "超自然音色-梓梓", value: "BV406_streaming" },
  { name: "超自然音色-燃燃2.0", value: "BV407_V2_streaming" },
  { name: "超自然音色-燃燃", value: "BV407_streaming" },
  { name: "通用女声", value: "BV001_streaming" },
  { name: "通用男声", value: "BV002_streaming" },
  { name: "擎苍", value: "BV701_streaming" },
  { name: "阳光青年", value: "BV123_streaming" },
  { name: "反卷青年", value: "BV120_streaming" },
  { name: "通用赘婿", value: "BV119_streaming" },
  { name: "古风少御", value: "BV115_streaming" },
  { name: "霸气青叔", value: "BV107_streaming" },
  { name: "质朴青年", value: "BV100_streaming" },
  { name: "温柔淑女", value: "BV104_streaming" },
  { name: "开朗青年", value: "BV004_streaming" },
  { name: "甜宠少御", value: "BV113_streaming" },
  { name: "儒雅青年", value: "BV102_streaming" },
  { name: "甜美小源", value: "BV405_streaming" },
  { name: "亲切女声", value: "BV007_streaming" },
  { name: "知性女声", value: "BV009_streaming" },
  { name: "诚诚", value: "BV419_streaming" },
  { name: "童童", value: "BV415_streaming" },
  { name: "亲切男声", value: "BV008_streaming" },
  { name: "译制片男声", value: "BV408_streaming" },
  { name: "懒小羊", value: "BV426_streaming" },
  { name: "清新文艺女声", value: "BV428_streaming" },
  { name: "鸡汤女声", value: "BV403_streaming" },
  { name: "智慧老者", value: "BV158_streaming" },
  { name: "慈爱姥姥", value: "BV157_streaming" },
  { name: "说唱小哥", value: "BR001_streaming" },
  { name: "活力解说男", value: "BV410_streaming" },
  { name: "影视解说小帅", value: "BV411_streaming" },
  { name: "解说小帅-多情感", value: "BV437_streaming" },
  { name: "影视解说小美", value: "BV412_streaming" },
  { name: "纨绔青年", value: "BV159_streaming" },
  { name: "直播一姐", value: "BV418_streaming" },
  { name: "沉稳解说男", value: "BV142_streaming" },
  { name: "潇洒青年", value: "BV143_streaming" },
  { name: "阳光男声", value: "BV056_streaming" },
  { name: "活泼女声", value: "BV005_streaming" },
  { name: "小萝莉", value: "BV064_streaming" },
  { name: "奶气萌娃", value: "BV051_streaming" },
  { name: "动漫海绵", value: "BV063_streaming" },
  { name: "动漫海星", value: "BV417_streaming" },
  { name: "动漫小新", value: "BV050_streaming" },
  { name: "天才童声", value: "BV061_streaming" },
  { name: "促销男声", value: "BV401_streaming" },
  { name: "促销女声", value: "BV402_streaming" },
  { name: "磁性男声", value: "BV006_streaming" },
  { name: "新闻女声", value: "BV011_streaming" },
  { name: "新闻男声", value: "BV012_streaming" },
  { name: "知性姐姐-双语", value: "BV034_streaming" },
  { name: "温柔小哥", value: "BV033_streaming" },
];
