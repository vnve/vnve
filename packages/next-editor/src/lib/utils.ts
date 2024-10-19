import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function downloadFile(filename: string, fileSrc: string) {
  const a = document.createElement("a");
  a.setAttribute("download", `${filename}.mp4`);
  a.setAttribute("href", fileSrc);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
