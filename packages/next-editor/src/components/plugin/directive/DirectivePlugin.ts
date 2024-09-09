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
    editingDirective: TDirectiveElement | null;
  },
  {
    floatingDirective: {
      hide: () => void;
      show: (
        mode: FloatingDirectiveMode,
        editorId: string,
        editingDirective: TDirectiveElement | null,
      ) => void;
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
      editingDirective: null,
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
            editingDirective: null,
          });
        },
        show: (
          mode: FloatingDirectiveMode,
          editorId: string,
          editingDirective: TDirectiveElement | null,
        ) => {
          setOptions({
            isEditing: false,
            mode,
            openEditorId: editorId,
            editingDirective,
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
