import Dexie, { Table } from "dexie";

export enum DBAssetType {
  Character = "Character",
  Background = "Background",
  Thing = "Thing",
  Audio = "Audio",
  Video = "Video",
}

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
}

export interface DBTemplate {
  id?: number;
  name: string;
  type: string;
  content: string;
}

export interface DBDraft {
  id?: number;
  name: string;
  time: number;
  content: string;
}

export class VNVEDexie extends Dexie {
  asset!: Table<DBAsset, number>;
  assetSource!: Table<DBAssetSource, number>;
  template!: Table<DBTemplate, number>;
  draft!: Table<DBDraft, number>;

  constructor() {
    super("vnve2");
    this.version(1).stores({
      asset: "++id, name, type, states",
      assetSource: "++id, mime, blob, ext",
      template: "++id, name, type, content",
      draft: "++id, name, time, content",
    });
  }
}

export const db = new VNVEDexie();
export const assetDB = db.asset;
export const assetSourceDB = db.assetSource;
export const templateDB = db.template;
export const draftDB = db.draft;

export const getAssetSourceURL = (id: number, extension: string) => {
  return `https://s/${id}.${extension}`;
};
