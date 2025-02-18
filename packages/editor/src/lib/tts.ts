interface SynthesisParams {
  token: string;
  appid: string;
  resourceId: string;
  text: string;
  voiceType: string;
  volume?: number;
  speed?: number;
  pitch?: number;
}

interface SynthesisTaskResponse {
  task_status: number;
  task_id: string;
}

interface SynthesisResult {
  audio_url: string;
  task_status: number;
}

export async function longTextSynthesis(
  params: SynthesisParams,
): Promise<SynthesisResult> {
  const { text, voiceType, volume, speed, pitch, token, appid, resourceId } =
    params;
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
    "volc.tts_async.default":
      "https://openspeech.bytedance.com/api/v1/tts_async/submit",
    "volc.tts_async.emotion":
      "https://openspeech.bytedance.com/api/v1/tts_async_with_emotion/submit",
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
    "volc.tts_async.default":
      "https://openspeech.bytedance.com/api/v1/tts_async/query",
    "volc.tts_async.emotion":
      "https://openspeech.bytedance.com/api/v1/tts_async_with_emotion/query",
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
