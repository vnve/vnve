/* eslint-disable */
/**
 * ref: https://github.com/w3c/webcodecs/blob/main/samples/lib/audio_renderer.js
 */
import { sliceAudioBuffer } from "../Utils";
import { MP4PullDemuxer, AUDIO_STREAM_TYPE } from "./MP4PullDemuxer.js";
import log from "loglevel";

const DATA_BUFFER_TARGET_SIZE = 300;

function debugLog(...args) {
  log.debug(...args)
}

export class AudioRenderer {
  async initialize(fileURL) {
    this.dataBuffer = [];
    this.fillInProgress = false;

    this.demuxer = new MP4PullDemuxer(fileURL);
    await this.demuxer.initialize(AUDIO_STREAM_TYPE);

    this.decoder = new AudioDecoder({
      output: this.bufferAudioData.bind(this),
      error: (e) => console.error(e),
    });
    const config = this.demuxer.getDecoderConfig();
    this.sampleRate = config.sampleRate;
    this.channelCount = config.numberOfChannels;

    debugLog(config);

    let support = await AudioDecoder.isConfigSupported(config);
    console.assert(support.supported);
    this.decoder.configure(config);

    this.init_resolver = null;
    let promise = new Promise((resolver) => (this.init_resolver = resolver));

    this.fillDataBuffer();
    return promise;
  }

  async render(timestamp, fps) {
    debugLog("render(%d)", timestamp);
    let data = await this.chooseData(timestamp, fps);
    this.fillDataBuffer();

    if (data == null) {
      console.warn("AudioRenderer.render(): no data ");
      return;
    }

    return data;
  }

  async chooseData(timestamp, fps) {
    if (this.dataBuffer.length == 0) return null;
    let dataIndex = 0

    // for(let i = 0; i < this.dataBuffer.length; i++) {
    //   const dataBuffer = this.dataBuffer[i]

    //   if (timestamp > (dataBuffer.timestamp + dataBuffer.duration)) {
    //     dataIndex = i;
    //   }
    // }

    // for (let i = 0; i < dataIndex; i++) {
    //   let staleData = this.dataBuffer.shift();
    //   staleData.close();
    // }

    const buffer = this.genAudioBuffer(this.dataBuffer);
    const chosenData = await sliceAudioBuffer(buffer, timestamp / 1000, fps);

    return chosenData;
  }

  async fillDataBuffer() {
    if (this.dataBufferFull()) {
      debugLog("frame buffer full");

      if (this.init_resolver) {
        this.init_resolver();
        this.init_resolver = null;
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
      this.dataBuffer.length < DATA_BUFFER_TARGET_SIZE &&
      this.decoder.decodeQueueSize < DATA_BUFFER_TARGET_SIZE
    ) {
      let chunk = await this.demuxer.getNextChunk();
      this.decoder.decode(chunk);
    }

    this.fillInProgress = false;

    // Give decoder a chance to work, see if we saturated the pipeline.
    setTimeout(this.fillDataBuffer.bind(this), 0);
  }

  dataBufferFull() {
    return this.dataBuffer.length >= DATA_BUFFER_TARGET_SIZE;
  }

  bufferAudioData(data) {
    debugLog(`bufferAudioData(${data.timestamp})`);
    this.dataBuffer.push(data);
  }

  audioDataToAudioBuffer(data) {
    let audioBuffer = new AudioBuffer({
      length: data.numberOfFrames,
      sampleRate: data.sampleRate,
      numberOfChannels: data.numberOfChannels,
    });

    for (let i = 0; i < data.numberOfChannels; i++) {
      data.copyTo(audioBuffer.getChannelData(i), { planeIndex: i });
    }

    return audioBuffer;
  }

  // 把多个AudioBuffer合并成一个AudioBuffer
  concatAudioBuffers(audioBuffers) {
    let length = audioBuffers.reduce((acc, audioBuffer) => {
      return acc + audioBuffer.length;
    }, 0);

    let sampleRate = audioBuffers[0].sampleRate;
    let numberOfChannels = audioBuffers[0].numberOfChannels;

    let audioBuffer = new AudioBuffer({
      length: length,
      sampleRate: sampleRate,
      numberOfChannels: numberOfChannels,
    });

    let offset = 0;
    audioBuffers.forEach((ab) => {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const channelData = audioBuffer.getChannelData(channel);
        channelData.set(ab.getChannelData(channel), offset);
      }
      offset += ab.length;
    });

    return audioBuffer;
  }

  // TODO: 直接从audioDataList进行
  genAudioBuffer(audioDataList) {
    const audioBuffers = audioDataList.map((data) => {
      return this.audioDataToAudioBuffer(data);
    });

    return this.concatAudioBuffers(audioBuffers);
  }
}
