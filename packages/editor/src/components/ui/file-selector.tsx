"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

interface FileSelectorProps {
  accept?: string;
  disabled?: boolean;
  onFileSelect: (file: File) => void;
}

export function FileSelector({
  accept,
  disabled,
  onFileSelect,
}: FileSelectorProps) {
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      onFileSelect(file);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex items-center space-x-4">
      <Button
        variant="outline"
        size="icon"
        onClick={handleButtonClick}
        aria-label="选择文件"
        disabled={disabled}
      >
        <Upload className="h-4 w-4" />
      </Button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept={accept}
      />
      {fileName && (
        <span className="text-sm text-gray-600">已选择文件: {fileName}</span>
      )}
    </div>
  );
}
