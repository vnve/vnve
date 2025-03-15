import { assetDB, assetSourceDB, DBAssetType } from "./db";
import classroomDay from "../assets/preset/background/classroom//day.webp";
import classroomNight from "../assets/preset/background/classroom/night.webp";
import schoolDay from "../assets/preset/background/school/day.webp";
import schoolNight from "../assets/preset/background/school/night.webp";
import maleDefault from "../assets/preset/character/male/default.webp";
import maleHappy from "../assets/preset/character/male/happy.webp";
import femaleDefault from "../assets/preset/character/female/default.webp";
import femaleHappy from "../assets/preset/character/female/happy.webp";
import thingBookRed from "../assets/preset/thing/book/red.webp";
import bgm1 from "../assets/preset/audio/bgm/bgm1.mp3";
import bgm2 from "../assets/preset/audio/bgm/bgm2.mp3";
import effectThunder from "../assets/preset/audio/effect/thunder.mp3";
import effectRain from "../assets/preset/audio/effect/rain.mp3";
import effectOpenDoor from "../assets/preset/audio/effect/open-door.mp3";
import effectKnockDoor from "../assets/preset/audio/effect/knock-door.mp3";
import fusionPixelZhHans from "../assets/preset/font/fusion-pixel/zh-hans.woff2";
import fusionPixelZhHant from "../assets/preset/font/fusion-pixel/zh-hant.woff2";

const PresetAssets = [
  {
    type: DBAssetType.Background,
    assets: [
      {
        name: "教室",
        states: [
          {
            name: "白天",
            url: classroomDay,
          },
          {
            name: "夜晚",
            url: classroomNight,
          },
        ],
      },
      {
        name: "学校",
        states: [
          {
            name: "白天",
            url: schoolDay,
          },
          {
            name: "夜晚",
            url: schoolNight,
          },
        ],
      },
    ],
  },
  {
    type: DBAssetType.Character,
    assets: [
      {
        name: "男主",
        states: [
          {
            name: "默认",
            url: maleDefault,
          },
          {
            name: "开心",
            url: maleHappy,
          },
        ],
      },
      {
        name: "女主",
        states: [
          {
            name: "默认",
            url: femaleDefault,
          },
          {
            name: "开心",
            url: femaleHappy,
          },
        ],
      },
    ],
  },
  {
    type: DBAssetType.Thing,
    assets: [
      {
        name: "书",
        states: [
          {
            name: "红色",
            url: thingBookRed,
          },
        ],
      },
    ],
  },
  {
    type: DBAssetType.Audio,
    assets: [
      {
        name: "BGM",
        states: [
          {
            name: "bgm1",
            url: bgm1,
          },
          {
            name: "bgm2",
            url: bgm2,
          },
        ],
      },
      {
        name: "日常声音",
        states: [
          {
            name: "开门声",
            url: effectOpenDoor,
          },
          {
            name: "敲门声",
            url: effectKnockDoor,
          },
          {
            name: "雨声",
            url: effectRain,
          },
          {
            name: "雷声",
            url: effectThunder,
          },
        ],
      },
    ],
  },
  {
    type: DBAssetType.Font,
    assets: [
      {
        name: "缝合像素字体",
        states: [
          {
            name: "缝合像素简中",
            url: fusionPixelZhHans,
          },
          {
            name: "缝合像素繁中",
            url: fusionPixelZhHant,
          },
        ],
      },
    ],
  },
];

async function importPresetAssetsToDB() {
  for (const presetAsset of PresetAssets) {
    const { type, assets } = presetAsset;

    for (const asset of assets) {
      const { name, states } = asset;
      const assetId = await assetDB.add({
        name,
        type,
        states: [],
      });

      for (const state of states) {
        try {
          const { name, url } = state;
          const ext = url.split(".").pop();
          const response = await fetch(url);
          const blob = await response.blob();
          const mime = response.headers.get("Content-Type") || "";
          const id = await assetSourceDB.add({
            mime,
            ext,
            blob,
            url,
          });

          await assetDB
            .where("id")
            .equals(assetId)
            .modify((asset) => {
              asset.states.push({
                id,
                name,
                ext,
                url,
              });
            });
        } catch (error) {
          console.error("导入预设资源失败", error);
        }
      }
    }
  }
}

const IS_PRESET_IMPORTED = "IS_PRESET_IMPORTED";

export async function checkAndImportPresetAssets() {
  try {
    if (localStorage.getItem(IS_PRESET_IMPORTED)) {
      return;
    }

    localStorage.setItem(IS_PRESET_IMPORTED, "true");

    // 如果已经存在手动导入的资源，不再导入预设资源
    if ((await assetSourceDB.count()) === 0) {
      await importPresetAssetsToDB();
    }
  } catch (error) {
    console.error("导入预设资源失败", error);
  }
}
