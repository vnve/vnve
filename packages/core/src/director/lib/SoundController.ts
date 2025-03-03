import { merge } from "lodash-es";
import { Sound } from "../../scene";
import { sliceAudioBuffer } from "../../util";
import { PlayDirectiveOptions } from "../directives";

class SoundController {
  public sliceTaskList: Promise<AudioBuffer>[] = [];
  private soundRecordMap: Map<
    string,
    {
      sound: Sound;
      paused: boolean;
      elapsedTime: number;
    } & Omit<
      Required<PlayDirectiveOptions>,
      "targetName" | "sequential" | "executeTime"
    >
  > = new Map();

  public get(name: string) {
    return this.soundRecordMap.get(name);
  }

  public play(sound: Sound, options: PlayDirectiveOptions) {
    const record = this.soundRecordMap.get(sound.name);

    if (record) {
      merge(record, {
        ...options,
        paused: false,
      });
    } else {
      const { start, volume, loop, untilEnd } = options;

      this.soundRecordMap.set(sound.name, {
        sound,
        paused: false,
        elapsedTime: 0,
        start: start ?? 0,
        volume: volume ?? 1,
        loop: loop ?? false,
        untilEnd: untilEnd ?? false,
      });
    }
  }

  public pause(sound: Sound) {
    const record = this.soundRecordMap.get(sound.name);

    if (record) {
      record.paused = true;
    }
  }

  public stop(sound: Sound) {
    this.soundRecordMap.delete(sound.name);
  }

  public update(_time: number, fps: number) {
    for (const record of this.soundRecordMap.values()) {
      const { sound, paused, elapsedTime, start, loop, volume } = record;

      if (paused) {
        continue;
      }

      if (sound.buffer) {
        // 开始时间 = 已经播放过的时间
        let startTime = elapsedTime;

        const duration = sound.buffer.duration;

        if (startTime > duration - start) {
          if (loop) {
            startTime = startTime % (duration - start);
          } else {
            continue;
          }
        }

        const slicedDuration = 1 / fps;
        const sliceTask = sliceAudioBuffer(
          sound.buffer,
          startTime + start,
          slicedDuration,
          volume,
        );

        // 叠加播放时间
        record.elapsedTime = elapsedTime + slicedDuration;

        this.sliceTaskList.push(sliceTask);
      }
    }
  }

  public async getAudioBuffers() {
    const audioBuffers = await Promise.all(this.sliceTaskList);

    this.sliceTaskList = [];

    return audioBuffers;
  }

  public resetExceptUtilEnd() {
    for (const [key, record] of this.soundRecordMap) {
      if (record.untilEnd) {
        continue;
      } else {
        this.soundRecordMap.delete(key);
      }
    }
  }

  public reset() {
    this.sliceTaskList = [];
    this.soundRecordMap.clear();
  }
}

export const soundController = new SoundController();
