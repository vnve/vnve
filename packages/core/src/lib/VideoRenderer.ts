/* eslint-disable */
/**
 * ref: https://github.com/w3c/webcodecs/blob/main/samples/lib/video_renderer.js
 */
import { MP4Demuxer, StreamType } from "./MP4Demuxer.ts";
import { log } from '../util'

const FRAME_BUFFER_TARGET_SIZE = 3;

function debugLog(...args: (string | number)[]) {
  log.debug(...args)
}

// Controls demuxing and decoding of the video track, as well as rendering
// VideoFrames to canvas. Maintains a buffer of FRAME_BUFFER_TARGET_SIZE
// decoded frames for future rendering.
export class VideoRenderer {
  public width!: number;
  public height!: number;
  public duration!: number;
  private demuxer!: MP4Demuxer;
  private frameBuffer!: VideoFrame[];
  private fillInProgress!: boolean;
  private canvasCtx!: CanvasRenderingContext2D;
  private decoder!: VideoDecoder;
  private init_resolver?: (value: unknown) => void;

  async initialize(fileURL: string, canvasCtx: CanvasRenderingContext2D, { width, height }: { width: number, height: number }) {
    this.frameBuffer = [];
    this.fillInProgress = false;

    this.demuxer = new MP4Demuxer(fileURL);
    const { video } = await this.demuxer.initialize(StreamType.VIDEO_STREAM_TYPE);
    const config = this.demuxer.getDecoderConfig();

    this.width = width > 0 ? width : config.displayWidth!;
    this.height = height > 0 ? height : config.displayHeight!;
    this.duration = video.duration / video.timescale;
    this.canvasCtx = canvasCtx
    this.canvasCtx.canvas.width = this.width;
    this.canvasCtx.canvas.height = this.height;

    this.decoder = new VideoDecoder({
      output: this.bufferFrame.bind(this),
      error: (e) => console.error(e),
    });

    let support = await VideoDecoder.isConfigSupported(config);
    console.assert(support.supported);
    this.decoder.configure(config);

    this.init_resolver = undefined;
    let promise = new Promise((resolver) => (this.init_resolver = resolver));

    this.fillFrameBuffer();
    return promise;
  }

  render(timestamp: number) {
    debugLog("render(%d)", timestamp);
    let frame = this.chooseFrame(timestamp);
    this.fillFrameBuffer();

    if (frame == null) {
      console.warn("VideoRenderer.render(): no frame ");
      return;
    }

    this.paint(frame);
    return frame
  }

  chooseFrame(timestamp: number) {
    if (this.frameBuffer.length == 0) return null;

    let minTimeDelta = Number.MAX_VALUE;
    let frameIndex = -1;

    for (let i = 0; i < this.frameBuffer.length; i++) {
      let time_delta = Math.abs(timestamp - this.frameBuffer[i].timestamp);
      if (time_delta < minTimeDelta) {
        minTimeDelta = time_delta;
        frameIndex = i;
      } else {
        break;
      }
    }

    console.assert(frameIndex != -1);

    if (frameIndex > 0) debugLog("dropping %d stale frames", frameIndex);

    for (let i = 0; i < frameIndex; i++) {
      let staleFrame = this.frameBuffer.shift();
      if (staleFrame) {
        staleFrame.close();
      }
    }

    let chosenFrame = this.frameBuffer[0];
    debugLog(
      "frame time delta = %dms (%d vs %d)",
      minTimeDelta / 1000,
      timestamp,
      chosenFrame.timestamp,
    );
    return chosenFrame;
  }

  async fillFrameBuffer() {
    if (this.frameBufferFull()) {
      debugLog("frame buffer full");

      if (this.init_resolver) {
        this.init_resolver(true);
        this.init_resolver = undefined;
      }

      return;
    }

    // This method can be called from multiple places and we some may already
    // be awaiting a demuxer read (only one read allowed at a time).
    if (this.fillInProgress) {
      return false;
    }
    this.fillInProgress = true;

    while (
      this.frameBuffer.length < FRAME_BUFFER_TARGET_SIZE &&
      this.decoder.decodeQueueSize < FRAME_BUFFER_TARGET_SIZE
    ) {
      let chunk = await this.demuxer.getNextChunk();
      this.decoder.decode(chunk);
    }

    this.fillInProgress = false;

    // Give decoder a chance to work, see if we saturated the pipeline.
    setTimeout(this.fillFrameBuffer.bind(this), 0);
  }

  frameBufferFull() {
    return this.frameBuffer.length >= FRAME_BUFFER_TARGET_SIZE;
  }

  bufferFrame(frame: VideoFrame) {
    debugLog(`bufferFrame(${frame.timestamp})`);
    this.frameBuffer.push(frame);
  }

  paint(frame: VideoFrame) {
    debugLog("paint(%d)", frame.timestamp);
    this.canvasCtx.drawImage(
      frame,
      0,
      0,
      this.width,
      this.height,
    )
  }

  async destroy() {
    if (this.decoder.state != "closed") {
      this.frameBuffer.forEach((frame) => frame.close());
      await this.decoder.flush();
      this.decoder.close();
    }

    this.demuxer.destroy();
  }
}
