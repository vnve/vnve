import { useMemo } from "react";
import { focusEditor, useEditorRef } from "@udecode/plate-common/react";
import { Icons } from "@/components/icons";
import { InsertDropdownMenu } from "./insert-dropdown-menu";
import { ToolbarGroup } from "./toolbar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEditorStore } from "@/store";
import { Sprite } from "@vnve/next-core";
import { DBAssetType } from "@/db";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DirectiveType } from "@/config";
import { triggerFloatingDirective } from "../plugin/directive";
import { ToolbarButton } from "./toolbar";
import { DirectiveSpeakForm } from "./directive-speak-form";

const Narrator = {
  name: "Narrator",
  label: "旁白",
};

export function FixedToolbarButtons({ speak, onChangeSpeak, children }) {
  const activeScene = useEditorStore((state) => state.activeScene);
  const characters = useMemo(() => {
    const results = [Narrator];

    if (!activeScene) {
      return results;
    }

    return [
      ...results,
      ...activeScene.children.filter(
        (child: Sprite) => child.assetType === DBAssetType.Character,
      ),
    ];
  }, [activeScene]);
  const editor = useEditorRef();

  const handleSelectCharacter = (name: string) => {
    const hitCharacter = characters.find(
      (character) => character.name === name,
    );

    onChangeSpeak({
      ...speak,
      speaker: {
        ...speak.speaker,
        speakerTargetName:
          hitCharacter.name === Narrator.name ? undefined : hitCharacter?.name,
        name:
          hitCharacter.name === Narrator.name ? "" : hitCharacter?.label || "",
      },
    });
  };

  const handleSelectDirectiveType = (type: DirectiveType) => {
    triggerFloatingDirective(editor, {
      directiveType: type,
    });

    focusEditor(editor);
  };

  return (
    <div className="w-full flex flex-wrap">
      <ToolbarGroup noSeparator>
        <Select
          value={speak.speaker.speakerTargetName}
          onValueChange={handleSelectCharacter}
        >
          <SelectTrigger className="w-[130px] h-8">
            <SelectValue placeholder="选择发言角色" />
          </SelectTrigger>
          <SelectContent>
            {characters.map((character) => (
              <SelectItem key={character.name} value={character.name}>
                {character.label}
              </SelectItem>
            ))}
            {characters.length === 1 && (
              <div className="select-none py-1.5 pl-2 pr-8 text-sm opacity-50">
                请先在画布中添加角色
              </div>
            )}
          </SelectContent>
        </Select>
        <Popover>
          <PopoverTrigger asChild>
            <ToolbarButton className="px-1" tooltip="发言设置">
              <Icons.settings className="!size-4 cursor-pointer mx-1" />
            </ToolbarButton>
          </PopoverTrigger>
          <PopoverContent>
            <DirectiveSpeakForm
              speak={speak}
              onChangeSpeak={onChangeSpeak}
            ></DirectiveSpeakForm>
          </PopoverContent>
        </Popover>
        <ToolbarButton
          className="px-1 text-xs"
          onClick={() => handleSelectDirectiveType(DirectiveType.Animation)}
          tooltip="插入动画"
        >
          <Icons.squarePlus className="!size-4 mr-0.5" /> 动画
        </ToolbarButton>
        <ToolbarButton
          className="px-1 text-xs"
          onClick={() => handleSelectDirectiveType(DirectiveType.Sound)}
          tooltip="插入音频"
        >
          <Icons.squarePlus className="!size-4 mr-0.5" />
          音频
        </ToolbarButton>
        <InsertDropdownMenu />
      </ToolbarGroup>

      <ToolbarGroup className="ml-auto">{children}</ToolbarGroup>
    </div>
  );
}
