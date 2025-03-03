import { Dialogue } from "@vnve/core";
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
    let input = document.createElement("input");
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
      input = null;
    });

    input.addEventListener("error", () => {
      reject(new Error("Error selecting files"));
      document.body.removeChild(input);
    });

    input.addEventListener("cancel", () => {
      reject(new Error("File deselected!"));
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

export function matchJSON(content: string) {
  const match = content.match(/\{[\s\S]*\}/);

  try {
    const jsonStr = match[0];
    const data = JSON.parse(jsonStr);

    return data;
  } catch {
    return null;
  }
}

export function linesToText(lines: Dialogue["lines"], pureText = false) {
  let speakText = "";

  lines.forEach((line) => {
    if (line.type === "p") {
      for (let index = 0; index < line.children.length; index++) {
        const child = line.children[index];

        if (!child.type) {
          let text = child.text;

          if (index === line.children.length - 1) {
            // 最后一个元素是文本，增加换行符
            text += "\n";
          }

          speakText += text;
        }
      }
    }
  });

  if (pureText) {
    speakText = speakText.replace(/\n/g, "");
  }

  return speakText;
}

export function fetchAudioFile(url: string, name: string, ext = "mp3") {
  return fetch(url)
    .then((response) => response.blob())
    .then((blob) => {
      const file = new File([blob], `${name}.${ext}`, {
        type: `audio/${ext}`,
      });

      return file;
    });
}
