"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FileSelector } from "./file-selector";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTemplates } from "@/components/hooks/useTemplates";
import { Label } from "./label";

interface TextFileEditorProps {
  children?: React.ReactNode;
  value: string;
  placeholder?: string;
  completeButtonLabel?: string;
  loading?: boolean | string;
  onChange: (value: string) => void;
  onComplete: (content: string) => void;
  onChangeTemplate?: (template: string) => void;
}

export function TextFileEditor({
  children,
  value,
  placeholder,
  completeButtonLabel,
  loading,
  onChange,
  onChangeTemplate,
  onComplete,
}: TextFileEditorProps) {
  const disabled = useMemo(() => !!loading, [loading]);
  const { customTemplates } = useTemplates();

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

  const templates = useMemo(() => {
    return [
      {
        name: "对话",
        value: "对话",
      },
      ...customTemplates.map((item) => {
        return {
          name: item.name,
          value: item.name,
        };
      }),
    ];
  }, [customTemplates]);

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
        <div className="flex items-center space-x-6">
          {onChangeTemplate && (
            <div className="flex items-center space-x-2">
              <span className="text-sm">场景模版:</span>
              <Select
                onValueChange={onChangeTemplate}
                defaultValue={templates[0].name}
              >
                <SelectTrigger className="flex-1 min-w-[150px]">
                  <SelectValue placeholder="请选择场景模版" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((option) => (
                    <SelectItem key={option.name} value={option.name}>
                      {option.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <Button onClick={handleComplete} disabled={disabled}>
            {loading && <Loader2 className="animate-spin mr-1" />}
            {loading ? loading : completeButtonLabel || "确定"}
          </Button>
        </div>
      </div>
    </div>
  );
}
