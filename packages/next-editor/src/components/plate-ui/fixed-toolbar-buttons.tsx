import React from "react";

import { BoldPlugin, ItalicPlugin } from "@udecode/plate-basic-marks/react";
import {
  FontColorPlugin,
  FontBackgroundColorPlugin,
  FontSizePlugin,
} from "@udecode/plate-font";
import { useEditorReadOnly } from "@udecode/plate-common/react";

import { Icons } from "@/components/icons";

import { MarkToolbarButton } from "./mark-toolbar-button";
import { ToolbarGroup } from "./toolbar";

export function FixedToolbarButtons() {
  const readOnly = useEditorReadOnly();

  return (
    <div className="w-full overflow-hidden">
      <div
        className="flex flex-wrap"
        style={{
          transform: "translateX(calc(-1px))",
        }}
      >
        {!readOnly && (
          <>
            <ToolbarGroup>
              <MarkToolbarButton nodeType={BoldPlugin.key} tooltip="Bold (⌘+B)">
                <Icons.bold />
              </MarkToolbarButton>
              <MarkToolbarButton
                nodeType={ItalicPlugin.key}
                tooltip="Italic (⌘+I)"
              >
                <Icons.italic />
              </MarkToolbarButton>
              <MarkToolbarButton
                nodeType={FontColorPlugin.key}
                tooltip="Italic (⌘+I)"
              >
                <Icons.color />
              </MarkToolbarButton>
            </ToolbarGroup>
          </>
        )}
      </div>
    </div>
  );
}
