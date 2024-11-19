import React, { useState } from "react";

import type { DropdownMenuProps } from "@radix-ui/react-dropdown-menu";

// import { BlockquotePlugin } from "@udecode/plate-block-quote/react";
// import { ParagraphPlugin, insertEmptyElement } from "@udecode/plate-common";
import { focusEditor, useEditorRef } from "@udecode/plate-common/react";
// import { HEADING_KEYS } from "@udecode/plate-heading";

import { Icons } from "@/components/icons";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  useOpenState,
} from "./dropdown-menu";
import { ToolbarButton } from "./toolbar";
import { triggerFloatingDirective } from "../plugin/directive";
import { DirectiveType } from "@/config";
import { useMedia } from "../hooks/useMedia";

const items = [
  {
    items: [
      // {
      //   description: "动画指令",
      //   icon: Icons.add,
      //   label: "动画指令",
      //   value: DirectiveType.Animation,
      // },
      // {
      //   description: "声音指令",
      //   icon: Icons.add,
      //   label: "声音指令",
      //   value: DirectiveType.Sound,
      // },
      {
        description: "工具指令",
        icon: Icons.squarePlus,
        label: "工具指令",
        value: DirectiveType.Util,
      },
      {
        description: "转场指令",
        icon: Icons.squarePlus,
        label: "转场指令",
        value: DirectiveType.Transition,
      },
      {
        description: "滤镜指令",
        icon: Icons.squarePlus,
        label: "滤镜指令",
        value: DirectiveType.Filter,
      },
    ],
    label: "更多指令",
  },
];

export function InsertDropdownMenu(props: DropdownMenuProps) {
  const isSm = useMedia("(min-width: 640px)");
  const editor = useEditorRef();
  const openState = useOpenState();

  function handleSelectDirectiveType(type: DirectiveType) {
    triggerFloatingDirective(editor, {
      directiveType: type,
    });

    // 移动端不需要focus
    if (isSm) {
      focusEditor(editor);
    }
  }

  return (
    <DropdownMenu modal={false} {...openState} {...props}>
      <DropdownMenuTrigger asChild>
        <ToolbarButton isDropdown pressed={openState.open} tooltip="更多指令">
          <Icons.add className="size-4" />
        </ToolbarButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        className="flex max-h-[500px] min-w-0 flex-col gap-0.5 overflow-y-auto"
      >
        {items.map(({ items: nestedItems, label }, index) => (
          <React.Fragment key={label}>
            {index !== 0 && <DropdownMenuSeparator />}

            <DropdownMenuLabel>{label}</DropdownMenuLabel>
            {nestedItems.map(
              ({ icon: Icon, label: itemLabel, value: type }) => (
                <DropdownMenuItem
                  className="min-w-[180px]"
                  key={type}
                  onSelect={() => handleSelectDirectiveType(type)}
                >
                  <Icon className="mr-2 size-4" />
                  {itemLabel}
                </DropdownMenuItem>
              ),
            )}
          </React.Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
