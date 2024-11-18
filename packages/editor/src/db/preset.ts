import { assetDB, assetSourceDB, DBAssetType } from "./db";
// import schoolDay from "../assets/preset/background/school/day.webp";

const PresetAssets = [
  {
    type: DBAssetType.Background,
    assets: [
      {
        name: "学校",
        states: [
          {
            name: "白天",
            url: "",
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
        const { name, url } = state;
        const ext = url.split(".").pop();
        const response = await fetch(url);
        const blob = await response.blob();
        const mime = response.headers.get("Content-Type") || "";
        const id = await assetSourceDB.add({
          mime,
          ext,
          blob,
        });

        await assetDB
          .where("id")
          .equals(assetId)
          .modify((asset) => {
            asset.states.push({
              id,
              name,
              ext,
            });
          });
      }
    }
  }
}

export async function checkAndImportPresetAssets() {
  try {
    if ((await assetSourceDB.count()) === 0) {
      await importPresetAssetsToDB();
    }
  } catch (error) {
    console.error("导入预设资源失败", error);
  }
}
