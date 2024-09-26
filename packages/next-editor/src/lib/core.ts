import { DBAsset, getAssetSourceURL } from "@/db";
import { SourceStore, Sprite } from "@vnve/next-core";
import { getIdFromObjectURL, isObjectURL } from "./utils";

export function registerSourceStore() {
  SourceStore.register({
    async getURL(sourceID) {
      if (sourceID && isNaN(+sourceID)) {
        return sourceID;
      }

      return getAssetSourceURL(+sourceID);
    },
    getID(sourceURL) {
      if (isObjectURL(sourceURL)) {
        return String(getIdFromObjectURL(sourceURL));
      }

      return sourceURL;
    },
    destroy(sourceURL) {
      if (isObjectURL(sourceURL)) {
        URL.revokeObjectURL(sourceURL);
      }
    },
  });
}

export async function createSprite(asset: DBAsset) {
  const defaultState = asset.states[0];
  const sprite = new Sprite({
    source:
      defaultState.type === "remote"
        ? defaultState.url
        : await getAssetSourceURL(defaultState.id),
  });

  sprite.label = asset.name;
  sprite.assetID = asset.id;
  sprite.assetType = asset.type;

  await sprite.load();

  return sprite;
}
