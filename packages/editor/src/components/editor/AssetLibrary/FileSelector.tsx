import { useEffect, useMemo, useRef, useState } from "react";
import { FileUp } from "lucide-react";
import { cn, getFileInfo } from "@/lib/utils";
import { AssetStatePreviewer } from "./AssetCard";
import { DBAssetType, genFileAccept } from "@/db";

export default function FileSelector({
  type,
  url,
  ext,
  className,
  onChange,
}: {
  type: DBAssetType;
  url?: string;
  ext?: string;
  className?: string;
  onChange: (file: File) => void;
}) {
  const [selectedFileUrl, setSelectedFileUrl] = useState<string | null>(null);
  const [selectedFileExt, setSelectedFileExt] = useState<string | null>(null);

  const fileUrl = useMemo(() => {
    if (selectedFileUrl) {
      return selectedFileUrl;
    }

    if (url) {
      return url;
    }

    return "";
  }, [url, selectedFileUrl]);

  const fileExt = useMemo(() => {
    if (selectedFileExt) {
      return selectedFileExt;
    }

    if (ext) {
      return ext;
    }

    return "";
  }, [ext, selectedFileExt]);

  const fileAccept = useMemo(() => {
    return genFileAccept(type);
  }, [type]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (selectedFileUrl) {
      URL.revokeObjectURL(selectedFileUrl);
    }

    const file = event.target.files?.[0];

    setSelectedFileUrl(URL.createObjectURL(file));
    setSelectedFileExt(getFileInfo(file).ext);
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
      <AssetStatePreviewer url={fileUrl} type={type} ext={fileExt} />
    </div>
  );
}
