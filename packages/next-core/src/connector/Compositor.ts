import * as Mp4Muxer from "mp4-muxer";
import { DEFAULT_AUDIO_CONFIG, DEFAULT_VIDEO_CONFIG, log, wait } from "../util";
import { Connector, ConnectorOptions, FrameData } from "./Connector";

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
    this.videoConfig = {
      ...DEFAULT_VIDEO_CONFIG,
    };
    this.audioConfig = {
      ...DEFAULT_AUDIO_CONFIG,
    };
  }

  public connect(): void {
    super.connect();
    this.createMuxerAndEncoder();
  }

  public async send(frameData: FrameData): Promise<void> {
    // TODO: to promise and do errorReject
    const { imageSource, audioBuffers, timestamp } = frameData;
    // video encode
    if (imageSource) {
      const videoFrame = new VideoFrame(imageSource, {
        timestamp: timestamp * 1000,
      });
      this.videoEncoder?.encode(videoFrame, {
        keyFrame: (timestamp / (1000 / this.options.fps)) % 150 === 0,
      });
      videoFrame.close();
    }

    // audio encode
    if (!this.options.disableAudio) {
      const audioData = await this.genAudioData(timestamp, audioBuffers);

      this.audioEncoder?.encode(audioData);
      audioData.close();
    }

    // TODO: hack避免主线程阻塞 待优化移动到worker中
    await wait(0);
  }

  private async genAudioData(
    timestamp: number,
    audioBuffers?: AudioBuffer[],
  ): Promise<AudioData> {
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
              : new Float32Array(numberOfFrames).fill(0);

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

    return new AudioData({
      timestamp,
      sampleRate,
      numberOfChannels,
      numberOfFrames,
      data,
      format: "f32-planar",
    });
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

    if (buffer) {
      const blob = new Blob([buffer], { type: "video/mp4" });

      if (this.muxer) {
        this.muxer = undefined;
      }

      return blob;
    }
  }

  public async finish() {
    const videoBlob = await this.endEncoding();

    return videoBlob;
  }
}
