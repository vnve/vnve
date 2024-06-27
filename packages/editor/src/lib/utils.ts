import { AnimatedGIF, Img } from "@vnve/core";
import { db } from "./db";
import { AssetItem } from "./assets";

export async function fetchImgAsBlob(url: string) {
  return await (await fetch(url)).blob();
}

export async function fetchSoundAsArrayBuffer(url: string) {
  return await (await fetch(url)).arrayBuffer();
}

export function assetFactory(
  items: Array<{ name: string; source: string }>,
  type: string[],
) {
  return items.map((item) => ({
    tag: [],
    ...item,
    type,
  }));
}

export function downloadFile(filename: string, fileSrc: string) {
  const a = document.createElement("a");
  a.setAttribute("download", `${filename}.mp4`);
  a.setAttribute("href", fileSrc);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function setSourceToDB(source?: string) {
  if (!source) {
    return;
  }

  if (source.startsWith("blob:")) {
    return source.split("#")[1]; // id=1 or draftId=1
  }

  return source;
}

export async function getSourceFromDB(source: string) {
  if (!source || /^(http|\/)/.test(source)) {
    return source;
  }

  const [assetType, idStr] = source.split("=");
  const id = Number(idStr);
  let blob;

  if (assetType === "id") {
    blob = (await db.assets.get(id)).source;
  } else if (assetType === "draftId") {
    blob = (await db.draftAssets.get(id)).source;
  } else {
    // unreachable
  }

  return `${URL.createObjectURL(blob)}#${assetType}=${id}`;
}

export function createImgOrAnimatedGIF(assetItem: AssetItem) {
  const { name, source, sourceType } = assetItem;

  return sourceType === "image/gif"
    ? new AnimatedGIF({ name, source })
    : new Img({
        name,
        source,
      });
}
