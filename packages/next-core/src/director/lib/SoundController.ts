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
      elapsedTime: number; // 记录已经播放的时间，用于暂停重播
    } & Omit<Required<PlayDirectiveOptions>, "targetName">
  > = new Map();

  public play(sound: Sound, options: PlayDirectiveOptions) {
    const record = this.soundRecordMap.get(sound.name);

    if (record) {
      Object.assign(record, {
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

  public update(time: number, fps: number) {
    for (const record of this.soundRecordMap.values()) {
      const { sound, paused, elapsedTime, start, loop, volume } = record;

      if (paused) {
        continue;
      }

      if (sound.buffer) {
        let startTime = elapsedTime;
        const duration = sound.buffer.duration;

        if (loop && startTime > duration - start) {
          startTime = startTime % (duration - start);
        }

        const sliceTask = sliceAudioBuffer(
          sound.buffer,
          startTime + start,
          1 / fps,
          volume,
        );

        this.sliceTaskList.push(sliceTask);
      }

      record.elapsedTime = time;
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
