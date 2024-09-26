import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isObjectURL(url: string) {
  return url.startsWith("blob:");
}

export function createObjectURL(blob: Blob, id: number) {
  return `${URL.createObjectURL(blob)}#id=${id}`;
}

export function getIdFromObjectURL(url: string): number {
  const id = url.match(/#id=(\d+)/);

  if (id) {
    return parseInt(id[1]);
  }

  return -1;
}
