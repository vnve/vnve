export class SourceStore {
  static register({
    getURL,
    getID,
    destroy,
  }: {
    getURL: (sourceID: string) => Promise<string>;
    getID: (sourceURL: string) => string;
    destroy: (sourceURL: string) => void;
  }) {
    SourceStore.getURL = getURL;
    SourceStore.getID = getID;
    SourceStore.destroy = destroy;
  }

  // source id => source url
  static async getURL(sourceID: string) {
    return sourceID;
  }

  // source url => source id
  static getID(sourceURL: string) {
    return sourceURL;
  }

  static destroy(sourceURL: string) {
    return;
  }
}
