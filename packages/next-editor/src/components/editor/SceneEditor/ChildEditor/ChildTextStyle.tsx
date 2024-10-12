import { useEditorStore } from "@/store";
import { Text } from "@vnve/next-core";
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

export function ChildTextStyle() {
  const editor = useEditorStore((state) => state.editor);
  const activeChild = useEditorStore((state) => state.activeChild) as Text;

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
    <div>
      <h3>ChildTextStyle</h3>
      <ul>
        <li>
          color:
          <ColorPicker
            value={activeChild.style.fill as string}
            onChange={handleTextStyleSelectValueChange("fill")}
          ></ColorPicker>
        </li>
        <li>
          Text:
          {!activeChild.disableTextEdit && (
            <Input
              value={activeChild.text}
              onChange={handleInputValueChange("text")}
            />
          )}
        </li>
        <li>
          FontFamily:
          <Select
            onValueChange={handleTextStyleSelectValueChange("fontFamily")}
            value={activeChild.style.fontFamily as string}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="---" />
            </SelectTrigger>
            <SelectContent>
              {SUPPORTED_FONT_FAMILY_LIST.map((option) => (
                <SelectItem key={option.en} value={option.en}>
                  {option.ch}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </li>
        <li>
          Font Style
          <ToggleGroup
            type="multiple"
            value={[activeChild.style.fontWeight, activeChild.style.fontStyle]}
            onValueChange={handleChangeTextWeightStyle}
          >
            <ToggleGroupItem value={SUPPORTED_FONT_WEIGHT.BOLD}>
              B
            </ToggleGroupItem>
            <ToggleGroupItem value={SUPPORTED_FONT_STYLE.ITALIC}>
              I
            </ToggleGroupItem>
          </ToggleGroup>
        </li>
        <li>
          FontSize:
          <Input
            value={activeChild.style.fontSize}
            onChange={handleTextStyleInputValueChange("fontSize", "number")}
            type="number"
            min={1}
            step={10}
          />
        </li>
      </ul>
    </div>
  );
}
