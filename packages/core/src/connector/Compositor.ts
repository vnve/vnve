import { Connector, ConnectorOptions, FrameData } from "./Connector";
import CompositorWorker from "./Compositor.worker?worker&inline";
import { DEFAULT_AUDIO_CONFIG, DEFAULT_VIDEO_CONFIG } from "../util";
import { AudioInfo, CompositorWorkerMessageType } from "./types";

/**
 * WebCodecs Video Compositor
 */
export class Compositor extends Connector {
  private compositorWorker: Worker;
  private initialized: Promise<void>;
  private videoConfig: VideoEncoderConfig;
  private audioConfig: AudioEncoderConfig;

  constructor(options: ConnectorOptions) {
    super(options);
    this.videoConfig = options.videoConfig ?? DEFAULT_VIDEO_CONFIG;
    this.audioConfig = options.audioConfig ?? DEFAULT_AUDIO_CONFIG;
    this.compositorWorker = new CompositorWorker();
    this.initialized = new Promise((resolve, reject) => {
      this.compositorWorker.addEventListener("message", (event) => {
        const { type } = event.data;

        if (type === CompositorWorkerMessageType.LOADED) {
          this.getFromWorker(CompositorWorkerMessageType.INIT, {
            videoConfig: this.videoConfig,
            audioConfig: this.audioConfig,
            ...options,
          })
            .then(() => {
              resolve();
            })
            .catch((e) => {
              reject(e);
            });
        }
      });
    });
  }

  getFromWorker<T>(
    type: CompositorWorkerMessageType,
    msgData?: ConnectorOptions | FrameData,
    transfer?: Transferable[],
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const msgListener = ({ data }: MessageEvent) => {
        if (data.type === type) {
          if (data.errMsg) {
            reject(data.errMsg);
          } else {
            resolve(data.result);
          }
          this.compositorWorker.removeEventListener("message", msgListener);
        }
      };

      this.compositorWorker.addEventListener("message", msgListener);
      this.compositorWorker.postMessage(
        {
          type,
          data: msgData,
        },
        transfer ? transfer : [],
      );
    });
  }

  private async genAudioInfo(
    timestamp: number,
    audioBuffers?: AudioBuffer[],
  ): Promise<AudioInfo> {
    const sampleRate = this.audioConfig.sampleRate;
    const numberOfChannels = this.audioConfig.numberOfChannels;
    const numberOfFrames = this.audioConfig.sampleRate * (1 / this.options.fps);
    const offlineAudioContext = new OfflineAudioContext(
      numberOfChannels,
      numberOfFrames,
      sampleRate,
    );
    const mixedAudioBuffer: AudioBuffer = offlineAudioContext.createBuffer(
      numberOfChannels,
      numberOfFrames,
      sampleRate,
    );
    let data: Float32Array;

    if (audioBuffers) {
      // mixin multi audio channel data
      audioBuffers.forEach((audioBuffer, bufferIndex) => {
        for (let channel = 0; channel < numberOfChannels; channel++) {
          // when some audioBuffer is single channel, fill with blank data
          const channelData =
            channel < audioBuffer.numberOfChannels
              ? audioBuffer.getChannelData(channel)
              : audioBuffer.getChannelData(0); // 假如是单声道，复制到所有声道

          const mixedChannelData = mixedAudioBuffer.getChannelData(channel);

          if (bufferIndex === 0) {
            mixedChannelData.set(channelData);
          } else {
            for (let i = 0; i < mixedChannelData.length; i++) {
              mixedChannelData[i] += channelData[i];
            }
          }
        }
      });

      // copy data from audioBuffer to adapt audioData
      data = new Float32Array(numberOfFrames * numberOfChannels);

      for (let i = 0; i < mixedAudioBuffer.numberOfChannels; i++) {
        data.set(
          mixedAudioBuffer.getChannelData(i),
          i * mixedAudioBuffer.length,
        );
      }
    } else {
      // fill with blank placeholder data
      data = new Float32Array(numberOfFrames * numberOfChannels).fill(0);
    }

    return {
      timestamp,
      sampleRate,
      numberOfChannels,
      numberOfFrames,
      data,
      format: "f32-planar",
    };
  }

  public async handle(frameData: FrameData): Promise<void> {
    await this.initialized;
    const { timestamp, imageSource, audioBuffers } = frameData;
    const videoFrame = new VideoFrame(imageSource, {
      timestamp: timestamp * 1000,
    });
    const transferList: Transferable[] = [videoFrame];

    let audioInfo: AudioInfo | undefined;

    if (!this.options.disableAudio) {
      // windows上直接transfer传递AudioData会crash
      // 传递到worker中再构建AudioData
      audioInfo = await this.genAudioInfo(timestamp, audioBuffers);

      transferList.push(audioInfo.data.buffer);
    }

    return this.getFromWorker(
      CompositorWorkerMessageType.SEND,
      {
        timestamp,
        videoFrame,
        audioInfo,
      } as FrameData,
      transferList,
    ) as Promise<void>;
  }

  public async finish() {
    await this.initialized;
    const buffer = (await this.getFromWorker(
      CompositorWorkerMessageType.FINISH,
    )) as ArrayBuffer;

    if (buffer) {
      return new Blob([buffer], { type: "video/mp4" });
    }
  }
}
