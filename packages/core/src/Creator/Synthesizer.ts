import * as Mp4Muxer from "mp4-muxer";
import { FrameTicker } from "./FrameTicker";
import { DEFAULT_AUDIO_CONFIG, DEFAULT_VIDEO_CONFIG } from "../Const";

export interface ISynthesizerOptions {
  width: number;
  height: number;
  duration: number;
  fps: number;
  ticker?: FrameTicker<ISynthesizerTickCtx>;
  threads?: number; // TODO: use worker threads to perf
  onProgress?: (percent: number) => void;
}

interface ISynthesizerTickCtx {
  imageSource?: CanvasImageSource;
  audioBuffers?: AudioBuffer[];
}

function noop(_e: Error) {
  console.log("noop log:", _e);
}

export class Synthesizer {
  public width: number;
  public height: number;
  public duration: number;
  public fps: number;
  public threads: number;
  public active: boolean;
  public onProgress?: (percent: number) => void;

  private ticker: FrameTicker<ISynthesizerTickCtx>;
  private muxer?: Mp4Muxer.Muxer<Mp4Muxer.ArrayBufferTarget>;
  private videoEncoder?: VideoEncoder;
  private audioEncoder?: AudioEncoder;
  private errorReject = noop;

  constructor(options: ISynthesizerOptions) {
    this.width = options.width;
    this.height = options.height;
    this.duration = options.duration;
    this.fps = options.fps;
    this.threads = options.threads ?? 1;
    this.ticker = options.ticker ?? new FrameTicker<ISynthesizerTickCtx>({});
    this.onProgress = options.onProgress;
    this.active = false;

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
        const videoFrame = new window.VideoFrame(imageSource, {
          timestamp: timestamp * 1000,
        });
        this.videoEncoder?.encode(videoFrame, {
          keyFrame: (timestamp / (1000 / this.fps)) % 150 === 0,
        });
        videoFrame.close();
      }

      // audio encode
      if (audioBuffers && audioBuffers.length > 0) {
        const audioData = await this.genAudioData(audioBuffers, timestamp);

        this.audioEncoder?.encode(audioData);
        audioData.close();
      } else {
        // fill with blank audio data
        const blankNumberOfFrames =
          DEFAULT_AUDIO_CONFIG.sampleRate * (1 / this.fps);
        const blankAudioData = new AudioData({
          timestamp,
          sampleRate: DEFAULT_AUDIO_CONFIG.sampleRate,
          numberOfChannels: DEFAULT_AUDIO_CONFIG.numberOfChannels,
          numberOfFrames: blankNumberOfFrames,
          data: new Float32Array(
            blankNumberOfFrames * DEFAULT_AUDIO_CONFIG.numberOfChannels,
          ).fill(0),
          format: "f32-planar",
        });

        this.audioEncoder?.encode(blankAudioData);
        blankAudioData.close();
      }

      if (this.onProgress) {
        this.onProgress(timestamp / this.duration);
      }

      // TODO: more process log
      // console.log("progress:", timestamp / this.duration);
    });
  }

  private async genAudioData(
    audioBuffers: AudioBuffer[],
    timestamp: number,
  ): Promise<AudioData> {
    const sampleRate = audioBuffers[0].sampleRate;
    const numberOfChannels = audioBuffers[0].numberOfChannels;
    const numberOfFrames = audioBuffers[0].length;
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

    // mixin multi audio channel data
    audioBuffers.forEach((audioBuffer, bufferIndex) => {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const channelData = audioBuffer.getChannelData(channel);
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
    const data = new Float32Array(
      mixedAudioBuffer.length * mixedAudioBuffer.numberOfChannels,
    );

    for (let i = 0; i < mixedAudioBuffer.numberOfChannels; i++) {
      data.set(mixedAudioBuffer.getChannelData(i), i * mixedAudioBuffer.length);
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
        width: this.width,
        height: this.height,
      },
      audio: {
        codec: "aac",
        numberOfChannels: 2,
        sampleRate: 44100,
      },
      firstTimestampBehavior: "offset",
    });

    // video encoder
    this.videoEncoder = new window.VideoEncoder({
      output: (chunk, meta) => {
        return this.muxer?.addVideoChunk(
          chunk,
          meta as EncodedAudioChunkMetadata,
          chunk.timestamp,
        );
      },
      error: (e) => this.errorReject(e),
    });
    this.videoEncoder.configure({
      ...DEFAULT_VIDEO_CONFIG,
      width: this.width,
      height: this.height,
    });

    // audio encoder
    this.audioEncoder = new AudioEncoder({
      output: (chunk, meta) => this.muxer?.addAudioChunk(chunk, meta),
      error: (e) => this.errorReject(e),
    });
    this.audioEncoder.configure(DEFAULT_AUDIO_CONFIG);
  }

  private async endEncoding() {
    await this.videoEncoder?.flush();
    this.videoEncoder?.close();
    await this.audioEncoder?.flush();
    this.audioEncoder?.close();

    this.muxer?.finalize();

    const buffer = this.muxer?.target?.buffer;

    if (buffer) {
      return new Blob([buffer]);
    }
  }

  public add(
    tick: (timestamp: number, tickCtx: ISynthesizerTickCtx) => Promise<void>,
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
            reject(e);
            return undefined;
          });

          resolve(videoBlob);
        })
        .catch(reject)
        .finally(() => {
          this.errorReject = noop;
          this.active = false;
          console.log("synthesize time:", Date.now() - startTime);
        });
    });
  }

  public stop() {
    this.active = false;
    this.ticker.stop();
  }
}
