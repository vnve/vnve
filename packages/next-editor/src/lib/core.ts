import { DBAsset, DBAssetType, getAssetSourceURL } from "@/db";
import { Editor, LayerZIndex, Sound, Sprite } from "@vnve/next-core";

export async function createSprite(asset: DBAsset, editor: Editor) {
  const states = asset.states;
  const state = states.find((state) => state.id === asset.stateId) ?? states[0];
  const sprite = new Sprite({
    source: getAssetSourceURL(state),
  });

  sprite.label = asset.name;
  sprite.assetID = asset.id;
  sprite.assetType = asset.type;

  // 默认设置（大小，层级，位置）
  if (asset.type === DBAssetType.Character) {
    sprite.zIndex = LayerZIndex.Character;
  } else if (asset.type === DBAssetType.Background) {
    sprite.zIndex = LayerZIndex.Background;
    sprite.width = editor.options.width;
    sprite.height = editor.options.height;
  }

  await sprite.load();

  return sprite;
}

export function createSound(asset: DBAsset) {
  const states = asset.states;
  const state = states.find((state) => state.id === asset.stateId) ?? states[0];
  const sound = new Sound({
    source: getAssetSourceURL(state),
  });

  sound.label = state.name; // 音频直接使用state的name
  sound.assetID = asset.id;
  sound.assetType = asset.type;

  return sound;
}
