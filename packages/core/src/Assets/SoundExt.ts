import {
  utils,
  ExtensionType,
  AssetExtension,
  LoaderParser,
  LoaderParserPriority,
} from "pixi.js";
import { arrayBufferToAudioBuffer } from "../Utils";

type ExtensionMap = Record<string, boolean>;

const exts: string[] = [
  "ogg",
  "oga",
  "opus",
  "m4a",
  "mp3",
  "mpeg",
  "wav",
  "aiff",
  "wma",
  "mid",
  "caf",
];

const mimes: string[] = ["audio/mpeg", "audio/ogg"];

const supported: ExtensionMap = {
  mp3: true,
};

// function validateFormats(typeOverrides?: Record<string, string>): void {
//   const overrides: Record<string, string> = {
//     m4a: "audio/mp4",
//     oga: "audio/ogg",
//     opus: 'audio/ogg; codecs="opus"',
//     caf: 'audio/x-caf; codecs="opus"',
//     ...(typeOverrides || {}),
//   };
//   const audio = document.createElement("audio");
//   const formats: ExtensionMap = {};
//   const no = /^no$/;

//   exts.forEach((ext) => {
//     const canByExt = audio.canPlayType(`audio/${ext}`).replace(no, "");
//     const canByType = overrides[ext]
//       ? audio.canPlayType(overrides[ext]).replace(no, "")
//       : "";

//     formats[ext] = !!canByExt || !!canByType;
//   });
//   Object.assign(supported, formats);
// }

// // initialize supported
// validateFormats();

export const SoundExt = {
  extension: ExtensionType.Asset,
  detection: {
    test: async () => true,
    add: async (formats) => [
      ...formats,
      ...exts.filter((ext) => supported[ext]),
    ],
    remove: async (formats) => formats.filter((ext) => formats.includes(ext)),
  },
  loader: {
    extension: {
      type: [ExtensionType.LoadParser],
      priority: LoaderParserPriority.High,
    },

    /** Should we attempt to load this file? */
    test(url: string): boolean {
      const ext = utils.path.extname(url).slice(1);

      return (
        !!supported[ext] || mimes.some((mime) => url.startsWith(`data:${mime}`))
      );
    },

    /** Load the sound file */
    async load(url: string): Promise<any> {
      const arrayBuffer = await (await fetch(url)).arrayBuffer();

      const data = await arrayBufferToAudioBuffer(arrayBuffer);

      return data;
    },
  } as LoaderParser<any>,
} as AssetExtension;
