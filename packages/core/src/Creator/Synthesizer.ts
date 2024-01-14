import * as Mp4Muxer from "mp4-muxer";
import { FrameTicker } from "./FrameTicker";
import { DEFAULT_AUDIO_CONFIG, DEFAULT_VIDEO_CONFIG } from "../Const";
import log from "loglevel";

export interface SynthesizerOptions {
  width: number;
  height: number;
  duration: number;
  fps: number;
  onlyVideo?: boolean;
  ticker?: FrameTicker<SynthesizerTickCtx>;
  videoConfig?: VideoConfig;
  audioConfig?: AudioConfig;
  onProgress?: (percent: number) => void;
}

interface SynthesizerTickCtx {
  imageSource?: CanvasImageSource;
  audioBuffers?: AudioBuffer[];
}

interface VideoConfig {
  width: number;
  height: number;
  codec: string;
  bitrate: number;
}

interface AudioConfig {
  codec: string;
  numberOfChannels: number;
  sampleRate: number;
  bitrate: number;
}

function noop(e: Error) {
  log.error("noop error", e);
}

export class Synthesizer {
  public width: number;
  public height: number;
  public duration: number;
  public fps: number;
  public onlyVideo: boolean;
  public active: boolean;
  public ticker: FrameTicker<SynthesizerTickCtx>;
  public onProgress?: (percent: number) => void;

  private videoConfig: VideoConfig;
  private audioConfig: AudioConfig;
  private muxer?: Mp4Muxer.Muxer<Mp4Muxer.ArrayBufferTarget>;
  private videoEncoder?: VideoEncoder;
  private audioEncoder?: AudioEncoder;
  private errorReject = noop;

  constructor(options: SynthesizerOptions) {
    this.width = options.width;
    this.height = options.height;
    this.duration = options.duration;
    this.fps = options.fps;
    this.onlyVideo = options.onlyVideo ?? false;
    this.ticker = options.ticker ?? new FrameTicker<SynthesizerTickCtx>({});
    this.onProgress = options.onProgress;
    this.active = false;
    this.videoConfig = {
      ...DEFAULT_VIDEO_CONFIG,
      ...(options.videoConfig || {}),
      width: this.width,
      height: this.height,
    };
    this.audioConfig = {
      ...DEFAULT_AUDIO_CONFIG,
      ...(options.audioConfig || {}),
    };

    this.createEncodeTickInterceptor();
  }

  public createEncodeTickInterceptor() {
    this.ticker.interceptor.after(async (timestamp, tickCtx) => {
      if (!this.active) {
        return;
      }

      const { imageSource, audioBuffers } = tickCtx;
      // video encode
      if (imageSource) {
        const videoFrame = new VideoFrame(imageSource, {
          timestamp: timestamp * 1000,
        });
        this.videoEncoder?.encode(videoFrame, {
          keyFrame: (timestamp / (1000 / this.fps)) % 150 === 0,
        });
        videoFrame.close();
      }

      if (!this.onlyVideo) {
        // audio encode
        const audioData = await this.genAudioData(timestamp, audioBuffers);

        this.audioEncoder?.encode(audioData);
        audioData.close();
      }

      if (this.onProgress) {
        this.onProgress(timestamp / this.duration);
      }

      log.debug("progress", timestamp / this.duration);
    });
  }

  private async genAudioData(
    timestamp: number,
    audioBuffers?: AudioBuffer[],
  ): Promise<AudioData> {
    const sampleRate = this.audioConfig.sampleRate;
    const numberOfChannels = this.audioConfig.numberOfChannels;
    const numberOfFrames = this.audioConfig.sampleRate * (1 / this.fps);
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
    this.videoEncoder = new window.VideoEncoder({
      output: (chunk, meta) => {
        return this.muxer?.addVideoChunk(
          chunk,
          meta as EncodedAudioChunkMetadata,
        );
      },
      error: (e) => {
        log.error("video encoder error", e);
        this.errorReject(e);
      },
    });
    this.videoEncoder.configure(this.videoConfig);

    if (!this.onlyVideo) {
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

  public add(
    tick: (timestamp: number, tickCtx: SynthesizerTickCtx) => Promise<void>,
  ) {
    this.ticker.add(tick);
  }

  public start(duration?: number): Promise<Blob | undefined> {
    if (duration) {
      this.duration = duration;
    }

    this.createMuxerAndEncoder();

    return new Promise((resolve, reject) => {
      const startTime = Date.now();

      this.errorReject = reject;
      this.active = true;

      this.ticker
        .run(this.duration, this.fps)
        .then(async () => {
          const videoBlob = await this.endEncoding().catch((e) => {
            log.error("end encode error", e);
            reject(e);
            return undefined;
          });

          resolve(videoBlob);
        })
        .catch((e) => {
          log.error("ticker run error", e);
          reject(e);
        })
        .finally(() => {
          this.errorReject = noop;
          this.active = false;
          log.debug("synthesize cost", Date.now() - startTime);
        });
    });
  }

  public stop() {
    this.active = false;
    this.ticker.stop();
  }
}
