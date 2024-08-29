import { Sound } from "../../scene";
import { sliceAudioBuffer } from "../../util";

class SoundController {
  public soundTaskList: Promise<AudioBuffer>[] = [];
  private soundRecordMap: Map<
    string,
    {
      sound: Sound;
      elapsedTime: number; // 记录已经播放的时间，用于暂停重播
      paused: boolean;
      loop: boolean;
      volume: number;
    }
  > = new Map();

  public play(sound: Sound) {
    const record = this.soundRecordMap.get(sound.name);

    if (record) {
      record.paused = false;
    } else {
      this.soundRecordMap.set(sound.name, {
        sound,
        elapsedTime: 0,
        paused: false,
        loop: false, // TODO: more
        volume: 1,
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
      if (record.paused) {
        continue;
      }
      const sound = record.sound;

      if (sound.buffer) {
        const soundTask = sliceAudioBuffer(
          sound.buffer,
          record.elapsedTime,
          1 / fps,
          record.volume,
        );

        this.soundTaskList.push(soundTask);
      }

      record.elapsedTime = time;
    }
  }

  public async getAudioInfos() {
    const audioInfos = await Promise.all(this.soundTaskList);

    this.soundTaskList = [];

    return audioInfos;
  }

  public destroy() {
    // TODO: 每个场景结束时，清空一次，仅保留需要持续播放的
    this.soundTaskList = [];
  }
}

export const soundController = new SoundController();
