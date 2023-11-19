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
