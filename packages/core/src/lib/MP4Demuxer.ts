/* eslint-disable */
// ref: https://github.com/w3c/webcodecs/blob/main/samples/audio-video-player/mp4_pull_demuxer.js
import MP4Box, { MP4ArrayBuffer, MP4AudioTrack, MP4Info, MP4Sample, MP4VideoTrack } from "mp4box";
import { log } from '../util'

export enum StreamType {
  AUDIO_STREAM_TYPE = 0,
  VIDEO_STREAM_TYPE = 1,
}

const { DataStream } = MP4Box

function debugLog(...args: string[]) {
  log.debug(...args)
}

export class MP4Demuxer {
  private fileUri: string;
  private streamType!: StreamType;
  private source!: MP4Source;
  private readySamples!: any[];
  private _pending_read_resolver?: (sample: MP4Sample)=> void;
  private audioTrack!: MP4AudioTrack;
  private videoTrack!: MP4VideoTrack;

  constructor(fileUri: string) {
    this.fileUri = fileUri;
  }

  async initialize(streamType: StreamType) {
    this.source = new MP4Source(this.fileUri);
    this.readySamples = [];
    this._pending_read_resolver = undefined;
    this.streamType = streamType;

    const info = await this._tracksReady();

    if (this.streamType == StreamType.AUDIO_STREAM_TYPE) {
      this._selectTrack(this.audioTrack);
    } else {
      this._selectTrack(this.videoTrack);
    }

    return info
  }

  getDecoderConfig() {
    if (this.streamType == StreamType.AUDIO_STREAM_TYPE) {
      return {
        codec: this.audioTrack.codec,
        sampleRate: this.audioTrack.audio.sample_rate,
        numberOfChannels: this.audioTrack.audio.channel_count,
        description: this.source.getAudioSpecificConfig(),
      };
    } else {
      return {
        // Browser doesn't support parsing full vp8 codec (eg: `vp08.00.41.08`),
        // they only support `vp8`.
        codec: this.videoTrack.codec.startsWith("vp08")
          ? "vp8"
          : this.videoTrack.codec,
        displayWidth: this.videoTrack.track_width,
        displayHeight: this.videoTrack.track_height,
        description: this._getDescription(this.source.getDescriptionBox()),
      };
    }
  }

  async getNextChunk() {
    let sample = await this._readSample();
    const type = sample.is_sync ? "key" : "delta";
    const pts_us = (sample.cts * 1000000) / sample.timescale;
    const duration_us = (sample.duration * 1000000) / sample.timescale;
    const ChunkType =
      this.streamType == StreamType.AUDIO_STREAM_TYPE
        ? EncodedAudioChunk
        : EncodedVideoChunk;
    return new ChunkType({
      type: type,
      timestamp: pts_us,
      duration: duration_us,
      data: sample.data,
    });
  }

  _getDescription(descriptionBox: any) {
    const stream = new DataStream(undefined, 0, DataStream.BIG_ENDIAN);
    descriptionBox.write(stream);
    return new Uint8Array(stream.buffer, 8); // Remove the box header.
  }

  async _tracksReady() {
    let info = await this.source.getInfo() as MP4Info;
    this.videoTrack = info.videoTracks[0];
    this.audioTrack = info.audioTracks[0];

    return {
      video: this.videoTrack,
      audio: this.audioTrack
    };
  }

  _selectTrack(track: MP4AudioTrack | MP4VideoTrack) {
    this.source.selectTrack(track);
  }

  async _readSample() {
    if (this.readySamples.length) {
      return Promise.resolve(this.readySamples.shift());
    }

    let promise = new Promise((resolver) => {
      this._pending_read_resolver = resolver;
    });
    this.source.start(this._onSamples.bind(this));
    return promise;
  }

  _onSamples(samples: MP4Sample[]) {
    const SAMPLE_BUFFER_TARGET_SIZE = 50;

    this.readySamples.push(...samples);
    if (this.readySamples.length >= SAMPLE_BUFFER_TARGET_SIZE)
      this.source.stop();

    let firstSampleTime = (samples[0].cts * 1000000) / samples[0].timescale;
    debugLog(
      `adding new ${samples.length} samples (first = ${firstSampleTime}). total = ${this.readySamples.length}`,
    );

    if (this._pending_read_resolver) {
      this._pending_read_resolver(this.readySamples.shift());
      this._pending_read_resolver = undefined;
    }
  }

  destroy() {
    this.readySamples = [];
    this.source.close();
  }
}

class MP4Source {
  private file: MP4Box.MP4File;
  private _onSamples!: (samples: MP4Sample[]) => void;
  private info?: MP4Info;
  private _info_resolver?: (info: MP4Info) => void;

  constructor(uri: string) {
    this.file = MP4Box.createFile();
    this.file.onError = console.error.bind(console);
    this.file.onReady = this.onReady.bind(this);
    this.file.onSamples = this.onSamples.bind(this);

    debugLog("fetching file");
    fetch(uri).then((response) => {
      debugLog("fetch responded");
      const reader = response.body!.getReader();
      let offset = 0;
      let mp4File = this.file;

      function appendBuffers({ done, value }: { done: boolean; value: Uint8Array }) {
        if (done) {
          mp4File.flush();
          return;
        }
        let buf = value.buffer as MP4ArrayBuffer;
        buf.fileStart = offset;

        offset += buf.byteLength;

        mp4File.appendBuffer(buf);

        return reader.read().then(appendBuffers as any);
      }

      return reader.read().then(appendBuffers as any);
    });

    this.info = undefined;
    this._info_resolver = undefined;
  }

  onReady(info: MP4Info) {
    this.info = info;

    if (this._info_resolver) {
      this._info_resolver(info);
      this._info_resolver = undefined;
    }
  }

  getInfo() {
    if (this.info) return Promise.resolve(this.info);

    return new Promise((resolver) => {
      this._info_resolver = resolver;
    });
  }

  getDescriptionBox() {
    // TODO: make sure this is coming from the right track.
    const entry = this.file.moov.traks[0].mdia.minf.stbl.stsd.entries[0];
    const box = entry.avcC || entry.hvcC || entry.vpcC || entry.av1C;
    if (!box) {
      throw new Error("avcC, hvcC, vpcC, or av1C box not found!");
    }
    return box;
  }

  getAudioSpecificConfig() {
    try {
      return this.file.moov.traks[0].mdia.minf.stbl.stsd.entries[0].esds.esd
      .descs[0].descs[0].data
    } catch (error) {
      return
    }
  }

  selectTrack(track: MP4AudioTrack | MP4VideoTrack) {
    this.file.setExtractionOptions(track.id);
  }

  start(onSamples: (samples: MP4Sample[]) => void) {
    this._onSamples = onSamples;
    this.file.start();
  }

  stop() {
    this.file.stop();
  }

  close() {
    this.file.flush();
  }

  onSamples(_track_id: number, _ref: any, samples: MP4Sample[]) {
    this._onSamples(samples);
  }
}
