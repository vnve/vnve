import { useEffect, useMemo, useRef, useState } from "react";
import { FileUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { AssetStatePreviewer } from "./AssetCard";
import { DBAssetType } from "@/db";

export default function FileSelector({
  type,
  url,
  className,
  onChange,
}: {
  type: DBAssetType;
  url?: string;
  className?: string;
  onChange: (file: File) => void;
}) {
  const [selectedFileUrl, setSelectedFileUrl] = useState<string | null>(null);
  const fileUrl = useMemo(() => {
    if (selectedFileUrl) {
      return selectedFileUrl;
    }

    if (url) {
      return url;
    }

    return "";
  }, [url, selectedFileUrl]);

  const fileAccept = useMemo(() => {
    switch (type) {
      case DBAssetType.Background:
      case DBAssetType.Character:
      case DBAssetType.Thing:
      case DBAssetType.Dialog:
        return ".webp, .png, .jpg";
      case DBAssetType.Audio:
        return ".mp3, .wav, .m4a, .aac";
      default:
        return "";
    }
  }, [type]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (selectedFileUrl) {
      URL.revokeObjectURL(selectedFileUrl);
    }

    const file = event.target.files?.[0] || null;

    setSelectedFileUrl(URL.createObjectURL(file));
    onChange(file);
  };

  const handleClickFileUp = () => {
    fileInputRef.current?.click();
  };

  useEffect(() => {
    return () => {
      if (selectedFileUrl) {
        URL.revokeObjectURL(selectedFileUrl);
      }
    };
  }, [selectedFileUrl]);

  return (
    <div
      className={cn("flex cursor-pointer group relative", className)}
      onClick={handleClickFileUp}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept={fileAccept}
      />
      <div className="size-full flex justify-center items-center text-sm invisible group-hover:visible bg-muted/80 absolute left-0 right-0 z-20">
        <FileUp className="size-4" />
        <div>选择文件</div>
      </div>
      <AssetStatePreviewer url={fileUrl} type={type} />
    </div>
  );
}
