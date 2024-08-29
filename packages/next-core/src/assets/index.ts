import { Assets, Texture, extensions } from "pixi.js";
import { BlobExt } from "./BlobExt";
import { SourceStore } from "./SourceStore";

extensions.add(BlobExt);

export { Assets, Texture, SourceStore };
