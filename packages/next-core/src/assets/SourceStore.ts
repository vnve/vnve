export class SourceStore {
  static register({
    get,
    set,
  }: {
    get: (source: string) => Promise<string>;
    set: (source: unknown) => string;
  }) {
    SourceStore.get = get;
    SourceStore.set = set;
  }

  // string source => raw source
  static async get(source: string) {
    return source;
  }

  // raw source => string source
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static set(source: any) {
    return source;
  }
}
