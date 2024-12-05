import * as Mp4Muxer from "mp4-muxer";
import { log, waitUntil } from "../util";
import { Connector, ConnectorOptions, FrameData } from "./Connector";
import { CompositorWorkerMessageType } from "./types";

function noop(e: Error) {
  log.error("noop error", e);
}

/**
 * WebCodecs Video Compositor
 */
export class Compositor extends Connector {
  private videoConfig: VideoEncoderConfig;
  private audioConfig: AudioEncoderConfig;
  private muxer?: Mp4Muxer.Muxer<Mp4Muxer.ArrayBufferTarget>;
  private videoEncoder?: VideoEncoder;
  private audioEncoder?: AudioEncoder;
  private errorReject = noop;

  constructor(options: ConnectorOptions) {
    super(options);
    this.videoConfig = options.videoConfig!;
    this.audioConfig = options.audioConfig!;
    this.createMuxerAndEncoder();
  }

  public async handle(frameData: FrameData): Promise<void> {
    const { videoFrame, audioInfo, timestamp } = frameData;
    // video encode
    if (videoFrame) {
      // control encode speed
      if (
        this.videoEncoder?.encodeQueueSize &&
        this.videoEncoder?.encodeQueueSize > 20
      ) {
        await waitUntil(() =>
          this.videoEncoder?.encodeQueueSize
            ? this.videoEncoder?.encodeQueueSize < 10
            : true,
        );
      }

      this.videoEncoder?.encode(videoFrame, {
        keyFrame: (timestamp / (1000 / this.options.fps)) % 150 === 0,
      });
      videoFrame.close();
    }

    // audio encode
    if (audioInfo) {
      const audioData = new AudioData({
        ...audioInfo,
      });
      this.audioEncoder?.encode(audioData);
      audioData.close();
    }
  }

  private createMuxerAndEncoder() {
    // muxer
    this.muxer = new Mp4Muxer.Muxer({
      target: new Mp4Muxer.ArrayBufferTarget(),
      video: {
        codec: "avc",
        width: this.videoConfig.width,
        height: this.videoConfig.height,
      },
      audio: {
        codec: "aac",
        numberOfChannels: this.audioConfig.numberOfChannels,
        sampleRate: this.audioConfig.sampleRate,
      },
    });

    // video encoder
    this.videoEncoder = new VideoEncoder({
      output: (chunk, meta) => {
        return this.muxer?.addVideoChunk(chunk, meta);
      },
      error: (e) => {
        log.error("video encoder error", e);
        this.errorReject(e);
      },
    });
    this.videoEncoder.configure(this.videoConfig);

    if (!this.options.disableAudio) {
      // audio encoder
      this.audioEncoder = new AudioEncoder({
        output: (chunk, meta) => this.muxer?.addAudioChunk(chunk, meta),
        error: (e) => {
          log.error("audio encoder error", e);
          this.errorReject(e);
        },
      });
      this.audioEncoder.configure(this.audioConfig);
    }
  }

  private async endEncoding() {
    await this.videoEncoder?.flush();
    this.videoEncoder?.close();
    await this.audioEncoder?.flush();
    this.audioEncoder?.close();

    this.muxer?.finalize();

    const buffer = this.muxer?.target?.buffer;

    return buffer;
  }

  public async finish() {
    const videoBlob = await this.endEncoding();

    return videoBlob;
  }
}

let compositor: Compositor;

self.addEventListener("message", async (event) => {
  const { type, data } = event.data;

  try {
    switch (type) {
      case CompositorWorkerMessageType.INIT:
        return handleInit(data);
      case CompositorWorkerMessageType.SEND:
        return await handleSend(data);
      case CompositorWorkerMessageType.FINISH:
        return await handleFinish();
      default:
        return;
    }
  } catch (e) {
    self.postMessage({
      type,
      errMsg: e instanceof Error ? e.message : "Unknown Error",
    });
  }
});

self.postMessage({ type: CompositorWorkerMessageType.LOADED });

function handleInit(data: ConnectorOptions) {
  compositor = new Compositor(data);

  self.postMessage({
    type: CompositorWorkerMessageType.INIT,
  });
}

async function handleSend(data: FrameData) {
  await compositor.handle(data);

  self.postMessage({ type: CompositorWorkerMessageType.SEND });
}

async function handleFinish() {
  const result = await compositor.finish();

  self.postMessage(
    { type: CompositorWorkerMessageType.FINISH, result },
    result ? [result] : [],
  );
}
