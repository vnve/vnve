import { loadFont } from "@/lib/font";
import { getFileInfo } from "@/lib/utils";
import Dexie, { Table } from "dexie";

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
}

export interface DBAssetState {
  id: number;
  name: string;
  ext: string;
}

export interface DBAsset {
  id?: number;
  name: string;
  type: DBAssetType;
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
    this.version(2).stores({
      asset: "++id, name, type, states",
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
  return `https://s/${assetState.id}.${assetState.ext}`;
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
