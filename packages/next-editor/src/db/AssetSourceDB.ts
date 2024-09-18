import { IndexableType } from "dexie";
import { db, DBAssetSource, VNVEDexie } from "./db";

/**
 * 所有的blob资源统一通过 AssetSourceDB 进行管理
 *
 * 提供缓存能力，避免重复创建 ObjectURL
 */
class AssetSourceDB {
  private cacheMap: Map<IndexableType, DBAssetSource> = new Map();
  private db: VNVEDexie;

  constructor(db: VNVEDexie) {
    this.db = db;
  }

  public createObjectURL(id: IndexableType, blob: Blob) {
    return `${URL.createObjectURL(blob)}#id=${id}`;
  }

  public getIdFromObjectURL(url: string): IndexableType {
    const id = url.match(/#id=(\d+)/);

    if (id) {
      return parseInt(id[1]);
    }

    return -1;
  }

  public async get(id: IndexableType) {
    if (this.cacheMap.has(id)) {
      return this.cacheMap.get(id);
    }

    const assetSource = await this.db.assetSource.get(id);

    assetSource.url = this.createObjectURL(id, assetSource.blob);

    this.cacheMap.set(id, assetSource);

    return assetSource;
  }

  public update(id: IndexableType, assetSource: DBAssetSource) {
    if (this.cacheMap.has(id)) {
      const cacheSource = this.cacheMap.get(id);

      if (cacheSource.url) {
        URL.revokeObjectURL(cacheSource.url);
      }

      assetSource.url = this.createObjectURL(id, assetSource.blob);

      this.cacheMap.set(id, assetSource);
    }

    return this.db.assetSource.update(id, assetSource);
  }

  public add(assetSource: DBAssetSource) {
    return this.db.assetSource.add(assetSource);
  }

  public delete(id: IndexableType) {
    if (this.cacheMap.has(id)) {
      const cacheSource = this.cacheMap.get(id);

      if (cacheSource.url) {
        URL.revokeObjectURL(cacheSource.url);
      }

      this.cacheMap.delete(id);
    }

    return this.db.assetSource.delete(id);
  }
}

export const assetSourceDB = new AssetSourceDB(db);
