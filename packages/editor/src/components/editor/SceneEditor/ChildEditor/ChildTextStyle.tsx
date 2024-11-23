import { useEditorStore } from "@/store";
import { Text } from "@vnve/core";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  SUPPORTED_FONT_FAMILY_LIST,
  SUPPORTED_FONT_STYLE,
  SUPPORTED_FONT_WEIGHT,
} from "@/lib/font";
import { ColorPicker } from "@/components/ui/color-picker";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Icons } from "@/components/icons";
import { useLiveQuery } from "dexie-react-hooks";
import { assetDB, DBAssetType } from "@/db";
import { useMemo } from "react";

export function ChildTextStyle() {
  const editor = useEditorStore((state) => state.editor);
  const activeChild = useEditorStore((state) => state.activeChild) as Text;
  const fontFolders = useLiveQuery(() =>
    assetDB.where("type").equals(DBAssetType.Font).reverse().toArray(),
  );
  const dbFonts = useMemo(() => {
    const fonts = [];

    if (!fontFolders) {
      return fonts;
    }

    for (const fontFolder of fontFolders) {
      for (const font of fontFolder.states) {
        fonts.push({
          ch: font.name,
          en: font.name,
        });
      }
    }

    return fonts;
  }, [fontFolders]);

  const handleInputValueChange =
    (key: string, type?: "number") =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      editor.updateActiveChild((child) => {
        if (type === "number") {
          child[key] = Number(e.target.value);
        } else {
          child[key] = e.target.value;
        }
      });
    };

  const handleTextStyleInputValueChange =
    (key: string, type?: "number") =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      editor.updateActiveChild((child: Text) => {
        if (type === "number") {
          child.style[key] = Number(e.target.value);
        } else {
          child.style[key] = e.target.value;
        }
      });
    };

  const handleTextStyleSelectValueChange = (key: string) => (value: string) => {
    editor.updateActiveChild((child: Text) => {
      child.style[key] = value;
    });
  };

  const handleChangeTextWeightStyle = (value: string[]) => {
    editor.updateActiveChild((child: Text) => {
      child.style.fontWeight = value.includes(SUPPORTED_FONT_WEIGHT.BOLD)
        ? SUPPORTED_FONT_WEIGHT.BOLD
        : SUPPORTED_FONT_WEIGHT.NORMAL;
      child.style.fontStyle = value.includes(SUPPORTED_FONT_STYLE.ITALIC)
        ? SUPPORTED_FONT_STYLE.ITALIC
        : SUPPORTED_FONT_STYLE.NORMAL;
    });
  };

  return (
    <div className="flex flex-col gap-3">
      {!activeChild.disableTextEdit && (
        <div className="flex gap-2">
          <div className="flex-1 flex gap-1 items-center">
            <Icons.bookOpenText className="w-5 h-5" />
            <Input
              value={activeChild.text}
              onChange={handleInputValueChange("text")}
            />
          </div>
        </div>
      )}
      <div className="flex gap-2">
        <div className="flex-1 flex gap-1 items-center">
          <Icons.color className="w-5 h-5" />
          <ColorPicker
            value={activeChild.style.fill as string}
            onChange={handleTextStyleSelectValueChange("fill")}
            className="w-6 h-6"
          ></ColorPicker>
        </div>
        <div className="flex-1 flex gap-1 items-center">
          <ToggleGroup
            type="multiple"
            value={[activeChild.style.fontWeight, activeChild.style.fontStyle]}
            onValueChange={handleChangeTextWeightStyle}
          >
            <ToggleGroupItem value={SUPPORTED_FONT_WEIGHT.BOLD} className="p-2">
              <Icons.bold className="size-4"></Icons.bold>
            </ToggleGroupItem>
            <ToggleGroupItem
              value={SUPPORTED_FONT_STYLE.ITALIC}
              className="p-2"
            >
              <Icons.italic className="size-4"></Icons.italic>
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>
      <div className="flex gap-2">
        <div className="flex-1 shrink-0 flex gap-1 items-center">
          <Icons.type className="w-5 h-5" />
          <Select
            onValueChange={handleTextStyleSelectValueChange("fontFamily")}
            value={activeChild.style.fontFamily as string}
          >
            <SelectTrigger className="h-6 max-w-[150px]">
              <SelectValue placeholder="---" />
            </SelectTrigger>
            <SelectContent>
              {[...dbFonts, ...SUPPORTED_FONT_FAMILY_LIST].map((option) => (
                <SelectItem key={option.en} value={option.en}>
                  {option.ch}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 shrink-0 flex gap-1 items-center">
          <Icons.fontSize className="w-5 h-5" />
          <Input
            value={String(activeChild.style.fontSize)}
            onChange={handleTextStyleInputValueChange("fontSize", "number")}
            type="number"
            min={1}
            step={10}
            className="h-6"
          />
        </div>
      </div>
    </div>
  );
}
