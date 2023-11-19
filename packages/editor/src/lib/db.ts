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

export class VNVEDexie extends Dexie {
  assets!: Table<AssetDBItem>;
  templates!: Table<TemplateDBItem>;

  constructor() {
    super("vnveDB");
    this.version(1).stores({
      assets: "++id, name, *type, *tag, source",
      templates: "++id, name, type, source",
    });
  }
}

export const db = new VNVEDexie();
