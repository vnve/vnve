/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * modified from
 * https://github.com/pixijs/sound/blob/main/src/soundAsset.ts
 */
import {
  ExtensionType,
  AssetExtension,
  LoaderParser,
  LoaderParserPriority,
  Texture,
} from "pixi.js";

export const BlobExt = {
  extension: ExtensionType.Asset,
  detection: {
    test: async () => true,
    add: async (formats) => [...formats],
    remove: async (formats) => formats.filter((ext) => formats.includes(ext)),
  },
  loader: {
    extension: {
      type: [ExtensionType.LoadParser],
      priority: LoaderParserPriority.High,
    },

    /** Should we attempt to load this file? */
    test(url: string): boolean {
      return url.startsWith("blob:");
    },

    /** Load the blob file */
    async load(url: string): Promise<any> {
      return Texture.from(url);
    },
  } as LoaderParser<any>,
} as AssetExtension;
