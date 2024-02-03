import { Child } from "@vnve/core";

export const LINE_GAP_TIME = 500;

export const DEFAULT_WORDS_PER_MINUTE = 600;

export const LINE_FADE_IN_DURATION = 500;

export function readingTime(text: string, wordsPerMinute = 600) {
  if (!text) {
    return 0;
  }

  text = text.trim();
  // step 1: count the number of Chinese characters
  const charArray = text.match(/[\u4e00-\u9fa5]/g);
  let charCount = 0;
  if (charArray != null) {
    charCount = charArray.length;
  }
  // step 2: replace all the Chinese characters with blank
  text = text.replace(/[\u4e00-\u9fa5]/g, " ");
  // step 3:replace newlines with blank
  text = text.replace(/[\r\n]/g, " ");
  // step 4:replace special characters with blank
  text = text.replace(/\W+/g, " ");
  // step 5: count the number of total English words
  const totalEnWords = text.trim().split(/\s+/g).length;
  const totalWords = totalEnWords + charCount;
  const wordsPerSecond = wordsPerMinute / 60;

  return parseFloat(((totalWords / wordsPerSecond) * 1000).toFixed(1));
}

export function getChildFromChildren(children: any[], child?: Child): any {
  if (child) {
    return children.find((item) => item.uuid === child.uuid);
  }

  return;
}

export function getChildFromChildrenById(children: any[], uuid: string): any {
  return children.find((item) => item.uuid === uuid);
}
