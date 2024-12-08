import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function downloadFile(
  filename: string,
  fileSrc: string,
  fileExt = "mp4",
) {
  const a = document.createElement("a");
  a.setAttribute("download", `${filename}.${fileExt}`);
  a.setAttribute("href", fileSrc);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export function getFileInfo(file: File) {
  const ext = file.name.split(".").pop() || "";
  const name = file.name.substring(0, file.name.lastIndexOf("."));

  return {
    name,
    ext,
  };
}

export function openFilePicker({ accept = "*", multiple = false } = {}) {
  return new Promise((resolve, reject) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = accept;
    input.multiple = multiple;
    input.style.display = "none";

    input.addEventListener("change", (event) => {
      const files = Array.from((event.target as HTMLInputElement).files || []);

      if (files.length > 0) {
        resolve(files);
      } else {
        reject(new Error("No files selected"));
      }
      document.body.removeChild(input);
    });

    input.addEventListener("error", () => {
      reject(new Error("Error selecting files"));
      document.body.removeChild(input);
    });

    document.body.appendChild(input);
    input.click();
  });
}

export function readTextFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target) {
        resolve(event.target.result as string);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}
