"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FileSelector } from "./file-selector";
import { Loader2 } from "lucide-react";

interface TextFileEditorProps {
  children?: React.ReactNode;
  value: string;
  placeholder?: string;
  completeButtonLabel?: string;
  loading?: boolean | string;
  onChange: (value: string) => void;
  onComplete: (content: string) => void;
}

export function TextFileEditor({
  children,
  value,
  placeholder,
  completeButtonLabel,
  loading,
  onChange,
  onComplete,
}: TextFileEditorProps) {
  const disabled = useMemo(() => !!loading, [loading]);

  const handleFileChange = async (file: File) => {
    const text = await file.text();
    onChange(text);
  };

  const handleTextareaChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    onChange(event.target.value);
  };

  const handleComplete = () => {
    onComplete(value);
  };

  return (
    <div className="space-y-4 w-full">
      <Textarea
        value={value}
        onChange={handleTextareaChange}
        placeholder={placeholder}
        className="min-h-[400px]"
        disabled={disabled}
      />
      <div className="flex items-center justify-between">
        {children ? (
          children
        ) : (
          <FileSelector
            disabled={disabled}
            onFileSelect={handleFileChange}
            accept=".txt"
          />
        )}
        <Button onClick={handleComplete} disabled={disabled}>
          {loading && <Loader2 className="animate-spin mr-1" />}
          {loading ? loading : completeButtonLabel || "确定"}
        </Button>
      </div>
    </div>
  );
}
