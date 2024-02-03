import Dexie, { Table } from "dexie";

export interface AssetDBItem {
  id?: number;
  name: string;
  type: string[];
  tag: string[];
  source: Blob;
}

export interface TemplateDBItem {
  id?: number;
  name: string;
  type: string[];
  source: string;
}

export interface DraftDBItem {
  id?: number;
  name: string;
  time: number;
  content: string;
}

export interface DraftAssetDBItem {
  id?: number;
  name?: string;
  source: Blob;
}

export class VNVEDexie extends Dexie {
  assets!: Table<AssetDBItem>;
  templates!: Table<TemplateDBItem>;
  drafts!: Table<DraftDBItem>;
  draftAssets!: Table<DraftAssetDBItem>;
  sourceURLMap: Record<number, string>;

  constructor() {
    super("vnveDB");
    this.version(2).stores({
      assets: "++id, name, *type, *tag, source",
      templates: "++id, name, type, source",
      drafts: "++id, name, time, content",
      draftAssets: "++id, name, source",
    });
    this.sourceURLMap = {};
  }

  addSourceURL(id: number, url: string) {
    this.sourceURLMap[id] = url;
  }

  updateSourceURL(id: number, url: string) {
    this.removeSourceURL(id);
    this.addSourceURL(id, url);
  }

  removeSourceURL(id: number) {
    const url = this.sourceURLMap[id];
    if (url && url.startsWith("blob:")) {
      URL.revokeObjectURL(url);
    }
    this.sourceURLMap[id] = "";
  }

  getSourceURL(id: number) {
    return this.sourceURLMap[id];
  }
}

export const db = new VNVEDexie();
