import { cn } from "@/lib/utils";
import { useEffect, useMemo } from "react";

function genTempFontFamily() {
  return `font-${Date.now()}`;
}

export function FontViewer({
  fontName,
  fontUrl,
  className,
}: {
  fontName: string;
  fontUrl: string;
  className?: string;
}) {
  const fontFamily = useMemo(() => {
    if (fontName) {
      return fontName;
    }

    if (fontUrl) {
      return genTempFontFamily();
    }
  }, [fontName, fontUrl]);

  useEffect(() => {
    if (fontName) {
      return;
    }

    const style = document.createElement("style");
    style.innerHTML = `
      @font-face {
        font-family: '${fontFamily}';
        src: url('${fontUrl}');
      }
    `;
    document.head.appendChild(style);

    return () => {
      if (fontName) {
        return;
      }

      document.head.removeChild(style);
    };
  }, [fontFamily, fontName, fontUrl]);

  return (
    <div
      className={cn(
        "w-full aspect-[1/1] flex flex-col justify-center items-center relative",
        className,
      )}
      style={{
        fontFamily,
      }}
    >
      <span>示例文字</span>
      <span>Sample Text</span>
      <span>0123456789</span>
    </div>
  );
}
