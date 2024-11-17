import type { TElement } from "@udecode/plate-common";
import { toPlatePlugin } from "@udecode/plate-common/react";
import {
  type PluginConfig,
  createSlatePlugin,
  insertNodes,
  setNodes,
} from "@udecode/plate-common";
import { type Location } from "slate";
import { DirectiveConfig } from "@vnve/core";
import { DirectiveType } from "@/config";

export type TDirectiveValue = DirectiveConfig & { label: string };

export interface TDirectiveElementBase {
  value: TDirectiveValue;
}

export interface TDirectiveElement extends TElement {
  value: TDirectiveValue;
}

export type FloatingDirectiveMode = "" | "insert" | "edit";

export type DirectivePluginConfig = PluginConfig<
  "directive",
  {
    openEditorId: string | null;
    mode: FloatingDirectiveMode;
    editingDirective: TDirectiveElement | null;
    directiveType: DirectiveType | null;
  },
  {
    floatingDirective: {
      hide: () => void;
      show: (
        mode: FloatingDirectiveMode,
        editorId: string,
        editingDirective: TDirectiveElement | null,
        directiveType: DirectiveType | null,
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
      mode: "",
      editingDirective: null,
      directiveType: null,
    },
  })
    .extendOptions(({ getOptions }) => ({
      isOpen: (editorId: string) => getOptions().openEditorId === editorId,
    }))
    .extendEditorApi<Partial<DirectivePluginConfig["api"]>>(
      ({ setOptions }) => ({
        floatingDirective: {
          hide: () => {
            setOptions({
              mode: "",
              openEditorId: null,
              editingDirective: null,
              directiveType: null,
            });
          },
          show: (
            mode: FloatingDirectiveMode,
            editorId: string,
            editingDirective: TDirectiveElement | null,
            directiveType: DirectiveType | null,
          ) => {
            setOptions({
              mode,
              openEditorId: editorId,
              editingDirective,
              directiveType,
            });
          },
        },
      }),
    )
    .extendEditorTransforms<DirectivePluginConfig["transforms"]>(
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
