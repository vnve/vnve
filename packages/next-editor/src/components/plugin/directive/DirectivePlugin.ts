import type { TElement } from "@udecode/plate-common";
import { toPlatePlugin } from "@udecode/plate-common/react";
import {
  type PluginConfig,
  createSlatePlugin,
  insertNodes,
  setNodes,
} from "@udecode/plate-common";
import { type Location } from "slate";

export interface TDirectiveValue {
  directive: string;
  params: any;
}

export interface TDirectiveElementBase {
  value: TDirectiveValue;
}

export interface TDirectiveElement extends TElement {
  value: TDirectiveValue;
}

export type FloatingDirectiveMode = "" | "insert" | "edit";

export type DirectiveConfig = PluginConfig<
  "directive",
  {
    openEditorId: string | null;
    isEditing: boolean;
    mode: FloatingDirectiveMode;
  },
  {
    floatingDirective: {
      hide: () => void;
      show: (mode: FloatingDirectiveMode, editorId: string) => void;
    };
  },
  {
    insert: {
      directive: (options: { value: TDirectiveValue }) => void;
    };
    edit: {
      directive: (options: { value: TDirectiveValue; at: Location }) => void;
    };
  }
>;

export const DirectivePlugin = toPlatePlugin(
  createSlatePlugin({
    key: "directive",
    node: {
      isElement: true,
      isInline: true,
      isMarkableVoid: true,
      isVoid: true,
    },
    options: {
      openEditorId: null,
      isEditing: false,
      mode: "",
    },
  })
    .extendOptions(({ getOptions }) => ({
      isOpen: (editorId: string) => getOptions().openEditorId === editorId,
    }))
    .extendEditorApi<Partial<DirectiveConfig["api"]>>(({ setOptions }) => ({
      floatingDirective: {
        hide: () => {
          setOptions({
            isEditing: false,
            mode: "",
            openEditorId: null,
          });
        },
        show: (mode: FloatingDirectiveMode, editorId: string) => {
          setOptions({
            isEditing: false,
            mode,
            openEditorId: editorId,
          });
        },
      },
    }))
    .extendEditorTransforms<DirectiveConfig["transforms"]>(
      ({ editor, type }) => ({
        insert: {
          directive: ({ value }) => {
            insertNodes<TDirectiveElement>(editor, {
              children: [{ text: "" }],
              type,
              value,
            });
          },
        },
        edit: {
          directive: ({ value, at }) => {
            setNodes<TDirectiveElement>(
              editor,
              {
                children: [{ text: "" }],
                type,
                value,
              },
              {
                at,
              },
            );
          },
        },
      }),
    ),
);
