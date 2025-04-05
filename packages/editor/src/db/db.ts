import { loadFont } from "@/lib/font";
import { downloadFile, getFileInfo, openFilePicker } from "@/lib/utils";
import Dexie, { Table } from "dexie";
import "dexie-export-import";

// 临时资源目录前缀
export const TMP_PREFIX = "__TMP__";

// 旁白资源ID
export const NARRATOR_ASSET_ID = 100000;

export enum DBAssetType {
  Character = "Character",
  Background = "Background",
  Thing = "Thing",
  Dialog = "Dialog",
  Audio = "Audio",
  Font = "Font",
}

export const DBAssetTypeOptions = [
  {
    name: "角色",
    value: DBAssetType.Character,
  },
  {
    name: "背景",
    value: DBAssetType.Background,
  },
  {
    name: "物品",
    value: DBAssetType.Thing,
  },
  {
    name: "对话框",
    value: DBAssetType.Dialog,
  },
  {
    name: "音频",
    value: DBAssetType.Audio,
  },
  {
    name: "字体",
    value: DBAssetType.Font,
  },
];

export const DBAssetTypeNameMap = DBAssetTypeOptions.reduce(
  (acc, { name, value }) => {
    acc[value] = name;
    return acc;
  },
  {} as Record<DBAssetType, string>,
);

export interface DBAssetSource {
  id?: number;
  mime: string;
  blob: Blob;
  ext: string;
  /**
   * url字段仅提供给预设资源使用
   */
  url?: string;
}

export interface DBAssetState {
  id: number;
  name: string;
  ext: string;
  /**
   * url字段仅提供给预设资源使用
   */
  url?: string;
}

export interface DBAsset {
  id?: number;
  name: string;
  type: DBAssetType;
  voice?: string;
  states: DBAssetState[];
  stateId?: number;
}

export interface DBTemplate {
  id?: number;
  name: string;
  type: string;
  content: string;
}

export interface DBProject {
  id?: number;
  name: string;
  time: number;
  content: string;
}

export class VNVEDexie extends Dexie {
  asset!: Table<DBAsset, number>;
  assetSource!: Table<DBAssetSource, number>;
  template!: Table<DBTemplate, number>;
  project!: Table<DBProject, number>;

  constructor() {
    super("vnve2");
    this.version(4).stores({
      asset: "++id, name, type, voice, states, [name+type]",
      assetSource: "++id, mime, blob, ext",
      template: "++id, name, type, content",
      project: "++id, name, time, content",
    });
  }
}

export const db = new VNVEDexie();
export const assetDB = db.asset;
export const assetSourceDB = db.assetSource;
export const templateDB = db.template;
export const projectDB = db.project;

export function getAssetSourceURL(assetState: DBAssetState) {
  return assetState.url || `https://s/${assetState.id}.${assetState.ext}`;
}

export function getAssetSourceURLByAsset(asset: DBAsset) {
  const state = asset.states.find((state) => state.id === asset.stateId);

  return state ? getAssetSourceURL(state) : "";
}

export function genFileAccept(type: DBAssetType) {
  switch (type) {
    case DBAssetType.Background:
    case DBAssetType.Character:
    case DBAssetType.Thing:
    case DBAssetType.Dialog:
      return ".webp, .png, .jpg, .jpeg, .gif, .mp4";
    case DBAssetType.Audio:
      return ".mp3, .wav, .m4a, .aac";
    case DBAssetType.Font:
      return ".ttf, .woff, .woff2";
    default:
      return "";
  }
}

export async function importAssetToDB() {
  const dirHandle = await window.showDirectoryPicker();

  for (const assetType of DBAssetTypeOptions) {
    const typeFolderHandle = await dirHandle
      .getDirectoryHandle(assetType.name)
      .catch(() => {});

    if (!typeFolderHandle) {
      continue;
    }

    for await (const [assetName, assetHandle] of typeFolderHandle.entries()) {
      if (assetHandle.kind === "directory") {
        const assetId = await assetDB.add({
          name: assetName,
          type: assetType.value,
          states: [],
        });

        for await (const [, stateHandle] of assetHandle.entries()) {
          if (stateHandle.kind === "file") {
            const source = await stateHandle.getFile();
            const { name, ext } = getFileInfo(source);
            const fileAccept = genFileAccept(assetType.value);

            if (fileAccept.includes(ext)) {
              const id = await assetSourceDB.add({
                mime: source.type,
                blob: source,
                ext,
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
    }
  }
}

export async function clearAssetDB() {
  await assetSourceDB.clear();
  await assetDB.clear();
}

export async function loadDBFonts() {
  const fontFolders = await assetDB
    .where("type")
    .equals(DBAssetType.Font)
    .toArray();

  for (const fontFolder of fontFolders) {
    for (const font of fontFolder.states) {
      await loadFont(font.name, getAssetSourceURL(font));
    }
  }
}

export async function getAssetById(id: number, stateName?: string) {
  const query = await assetDB.get(id);

  if (stateName) {
    const hit = query.states.find((state) => state.name === stateName);

    return hit
      ? {
          ...query,
          stateId: hit.id,
        }
      : undefined;
  }

  return query;
}

export async function getAssetByName(
  name: string,
  stateName?: string,
  type?: DBAssetType,
): Promise<DBAsset | undefined> {
  const params: { name: string; type?: DBAssetType } = { name };
  if (type) {
    params.type = type;
  }
  const query = await assetDB.where(params).first();

  if (query && stateName) {
    const hit = query.states.find((state) => state.name === stateName);

    return hit
      ? {
          ...query,
          stateId: hit.id,
        }
      : undefined;
  }

  return query;
}

export async function exportDB() {
  const blob = await db.export();
  const dbObjectURL = URL.createObjectURL(blob);
  downloadFile("book", dbObjectURL, "vnve");
  URL.revokeObjectURL(dbObjectURL);
}

export async function importDB() {
  const files = await openFilePicker({ accept: ".vnve" });
  const file = files[0];

  if (file) {
    await db.import(file);
  }
}

export async function getAllAssetNamesByType(type: DBAssetType) {
  const assets = await assetDB.where("type").equals(type).toArray();

  return assets.map((asset) => asset.name);
}

// TODO: 替换nanoid
function randomName() {
  return Math.random().toString(36).substring(2, 8);
}

export async function importAssetToProjectTmp(
  projectId: number,
  assetType: DBAssetType,
  file: File,
) {
  const tmpAssetName = `${TMP_PREFIX}${projectId}`;
  let tmpAsset = await getAssetByName(tmpAssetName, undefined, assetType);

  if (!tmpAsset) {
    const id = await assetDB.add({
      name: tmpAssetName,
      type: assetType,
      states: [],
    });

    tmpAsset = await getAssetById(id);
  }

  const { name, ext } = getFileInfo(file);
  const id = await assetSourceDB.add({
    mime: file.type,
    blob: file,
    ext,
  });

  tmpAsset.stateId = id;
  tmpAsset.states.push({
    id,
    name: `${name}_${randomName()}`,
    ext,
  });

  await assetDB.update(tmpAsset.id, { states: tmpAsset.states });

  return tmpAsset;
}

export async function removeProjectTmpAssets(projectId: number) {
  const tmpAssetName = `${TMP_PREFIX}${projectId}`;
  const assets = await assetDB.where("name").equals(tmpAssetName).toArray();

  for (const asset of assets) {
    await assetDB.delete(asset.id);
    for (const state of asset.states) {
      await assetSourceDB.delete(state.id);
    }
  }
}

export async function insertNarratorAsset() {
  const existingAsset = await assetDB.get(NARRATOR_ASSET_ID);

  if (!existingAsset) {
    await assetDB.put({
      id: NARRATOR_ASSET_ID,
      name: "旁白",
      type: DBAssetType.Character,
      states: [],
    });
  }
}
