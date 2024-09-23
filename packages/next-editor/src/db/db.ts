import Dexie, { IndexableType, Table } from "dexie";

export enum DBAssetType {
  Character = "Character",
  Background = "Background",
  Thing = "Thing",
  Audio = "Audio",
  Video = "Video",
}

export interface DBAssetSource {
  id?: number;
  name: string;
  mime: string;
  blob: Blob;
  url: string;
}

export interface DBAsset {
  id?: number;
  name: string;
  type: DBAssetType;
  states: IndexableType[];
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
  asset!: Table<DBAsset>;
  assetSource!: Table<DBAssetSource>;
  template!: Table<DBTemplate>;
  draft!: Table<DBDraft>;

  constructor() {
    super("vnve2");
    this.version(1).stores({
      asset: "++id, name, type, states",
      assetSource: "++id, name, mime, blob",
      template: "++id, name, type, content",
      draft: "++id, name, time, content",
    });
  }
}

export const db = new VNVEDexie();
export const assetDB = db.asset;
export const templateDB = db.template;
export const draftDB = db.draft;
