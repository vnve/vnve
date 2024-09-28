import { DBAsset, getAssetSourceURL } from "@/db";
import { Sprite } from "@vnve/next-core";

export async function createSprite(asset: DBAsset) {
  const defaultState = asset.states[0];
  const sprite = new Sprite({
    source: getAssetSourceURL(defaultState.id, defaultState.ext),
  });

  sprite.label = asset.name;
  sprite.assetID = asset.id;
  sprite.assetType = asset.type;

  await sprite.load();

  return sprite;
}
