import { createObjectURL } from "@/lib/utils";
import { db, DBAssetSource, VNVEDexie } from "@/db";

/**
 * 只给AssetLibrary使用的AssetSource缓存访问
 *
 * 提供缓存能力，避免重复创建 ObjectURL
 */
class AssetLibraryCache {
  private cacheMap: Map<number, DBAssetSource> = new Map();
  private db: VNVEDexie;

  constructor(db: VNVEDexie) {
    this.db = db;
  }

  public async get(id: number) {
    if (this.cacheMap.has(id)) {
      return this.cacheMap.get(id);
    }

    const assetSource = await this.db.assetSource.get(id);

    assetSource.url = createObjectURL(assetSource.blob, id);

    this.cacheMap.set(id, assetSource);

    return assetSource;
  }

  public update(id: number, assetSource: DBAssetSource) {
    if (this.cacheMap.has(id)) {
      const cacheSource = this.cacheMap.get(id);

      if (cacheSource.url) {
        URL.revokeObjectURL(cacheSource.url);
      }

      assetSource.url = createObjectURL(assetSource.blob, id);

      this.cacheMap.set(id, assetSource);
    }

    return this.db.assetSource.update(id, assetSource);
  }

  public add(assetSource: DBAssetSource) {
    return this.db.assetSource.add(assetSource);
  }

  public delete(id: number) {
    if (this.cacheMap.has(id)) {
      const cacheSource = this.cacheMap.get(id);

      if (cacheSource.url) {
        URL.revokeObjectURL(cacheSource.url);
      }

      this.cacheMap.delete(id);
    }

    return this.db.assetSource.delete(id);
  }

  public clearCache() {
    this.cacheMap.forEach((assetSource) => {
      if (assetSource.url) {
        URL.revokeObjectURL(assetSource.url);
      }
    });
    this.cacheMap.clear();
  }
}

export const assetLibraryCache = new AssetLibraryCache(db);
